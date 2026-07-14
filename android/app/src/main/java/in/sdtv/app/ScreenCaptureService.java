package in.sdtv.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.WindowManager;

import androidx.core.app.NotificationCompat;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutorService;

public class ScreenCaptureService extends Service {

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_RESULT_CODE = "EXTRA_RESULT_CODE";
    public static final String EXTRA_RESULT_DATA = "EXTRA_RESULT_DATA";

    private static final String CHANNEL_ID = "ScreenCaptureChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String TAG = "ScreenCaptureService";

    private MediaProjectionManager projectionManager;
    private MediaProjection mediaProjection;
    private VirtualDisplay virtualDisplay;
    private ImageReader imageReader;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable captureRunnable;
    private Runnable heartbeatRunnable;

    private String supabaseUrl = ""; 
    private String supabaseAnonKey = ""; 
    private String sessionId = "";
    private String devoteeEmail = "";
    private ExecutorService executor = java.util.concurrent.Executors.newSingleThreadExecutor();
    private volatile boolean isUploading = false;

    @Override
    public void onCreate() {
        super.onCreate();
        projectionManager = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            if (intent != null) {
                String action = intent.getAction();
                if (ACTION_START.equals(action)) {
                    int resultCode = intent.getIntExtra(EXTRA_RESULT_CODE, 0);
                    Intent resultData = intent.getParcelableExtra(EXTRA_RESULT_DATA);
                    // Extract keys if passed from React
                    if (intent.hasExtra("SUPABASE_ANON_KEY")) {
                        supabaseAnonKey = intent.getStringExtra("SUPABASE_ANON_KEY");
                        sessionId = intent.getStringExtra("SESSION_ID");
                        supabaseUrl = intent.getStringExtra("SUPABASE_URL");
                        devoteeEmail = intent.getStringExtra("EMAIL");
                    }
                    startRecording(resultCode, resultData);
                } else if (ACTION_STOP.equals(action)) {
                    stopRecording();
                }
            }
        } catch (Throwable t) {
            Log.e(TAG, "Fatal crash in onStartCommand", t);
            final String msg = t.getMessage();
            new Handler(Looper.getMainLooper()).post(() -> 
                android.widget.Toast.makeText(getApplicationContext(), "Fatal Error: " + msg, android.widget.Toast.LENGTH_LONG).show()
            );
            stopSelf();
        }
        return START_NOT_STICKY;
    }

    private void startRecording(int resultCode, Intent resultData) {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Watch & Earn Active")
                .setContentText("Screen recording is running in the background.")
                .setSmallIcon(android.R.drawable.ic_menu_camera)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        mediaProjection = projectionManager.getMediaProjection(resultCode, resultData);

        WindowManager windowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics metrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(metrics);
        int mWidth = metrics.widthPixels;
        int mHeight = metrics.heightPixels;
        int mDensity = metrics.densityDpi;

        // Downscale directly at the VirtualDisplay level to save memory and avoid Samsung padding bugs
        int targetWidth = 360;
        int targetHeight = (int) (mHeight * ((float) targetWidth / mWidth));
        targetHeight = (targetHeight / 2) * 2; // Ensure even dimension for ImageReader

        imageReader = ImageReader.newInstance(targetWidth, targetHeight, PixelFormat.RGBA_8888, 2);

        mediaProjection.registerCallback(new android.media.projection.MediaProjection.Callback() {
            @Override
            public void onStop() {
                super.onStop();
                stopSelf();
            }
        }, null);

        virtualDisplay = mediaProjection.createVirtualDisplay("ScreenCapture",
                targetWidth, targetHeight, mDensity,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                imageReader.getSurface(), null, null);

        captureRunnable = new Runnable() {
            @Override
            public void run() {
                captureAndUploadFrame();
                handler.postDelayed(this, 1000); // Capture every 1000ms to save battery and avoid queue backup
            }
        };
        handler.postDelayed(captureRunnable, 1000); // Start after 1 second
        
        heartbeatRunnable = new Runnable() {
            @Override
            public void run() {
                sendHeartbeat();
                handler.postDelayed(this, 10000); // Send heartbeat every 10 seconds
            }
        };
        handler.postDelayed(heartbeatRunnable, 10000);

        new Handler(Looper.getMainLooper()).post(() -> 
            android.widget.Toast.makeText(getApplicationContext(), "Live Seva Stream Started!", android.widget.Toast.LENGTH_SHORT).show()
        );
    }

    private void captureAndUploadFrame() {
        Image image = null;
        Bitmap bitmap = null;
        Bitmap scaledBitmap = null;
        try {
            image = imageReader.acquireLatestImage();
            if (image != null) {
                Image.Plane[] planes = image.getPlanes();
                ByteBuffer buffer = planes[0].getBuffer();
                int pixelStride = planes[0].getPixelStride();
                int rowStride = planes[0].getRowStride();
                int rowPadding = rowStride - pixelStride * image.getWidth();

                int width = image.getWidth();
                int height = image.getHeight();
                int bitmapWidth = width + rowPadding / pixelStride;
                
                if (bitmapWidth <= 0 || height <= 0) {
                    return; // Avoid IllegalArgumentException on some devices
                }

                bitmap = Bitmap.createBitmap(bitmapWidth, height, Bitmap.Config.ARGB_8888);
                bitmap.copyPixelsFromBuffer(buffer);

                // Compress heavily to save bandwidth
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                // If there's row padding, we need to crop the bitmap to the actual width to remove black bars
                if (rowPadding > 0) {
                    Bitmap croppedBitmap = Bitmap.createBitmap(bitmap, 0, 0, image.getWidth(), image.getHeight());
                    croppedBitmap.compress(Bitmap.CompressFormat.JPEG, 30, bos);
                    croppedBitmap.recycle();
                } else {
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 30, bos);
                }
                byte[] bitmapData = bos.toByteArray();
                String base64Frame = "data:image/jpeg;base64," + android.util.Base64.encodeToString(bitmapData, android.util.Base64.NO_WRAP);

                uploadToSupabase(base64Frame);
            }
        } catch (Throwable t) {
            Log.e(TAG, "Error capturing frame", t);
            final String msg = t.getMessage();
            new Handler(Looper.getMainLooper()).post(() -> 
                android.widget.Toast.makeText(getApplicationContext(), "Capture Error: " + msg, android.widget.Toast.LENGTH_SHORT).show()
            );
        } finally {
            if (scaledBitmap != null && !scaledBitmap.isRecycled()) {
                scaledBitmap.recycle();
            }
            if (bitmap != null && !bitmap.isRecycled()) {
                bitmap.recycle();
            }
            if (image != null) {
                image.close();
            }
        }
    }

    private void uploadToSupabase(String base64Frame) {
        if (supabaseUrl == null || supabaseUrl.isEmpty() || supabaseAnonKey == null || supabaseAnonKey.isEmpty()) {
            return;
        }

        if (isUploading) {
            return; // Drop frame if previous HTTP POST is still running to prevent OOM
        }
        isUploading = true;

        executor.execute(() -> {
            try {
                java.net.URL url = new java.net.URL(supabaseUrl + "/realtime/v1/api/broadcast");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("apikey", supabaseAnonKey);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setDoOutput(true);

                org.json.JSONObject payload = new org.json.JSONObject();
                payload.put("frame", base64Frame);
                payload.put("email", devoteeEmail != null ? devoteeEmail : "unknown");
                payload.put("session_id", sessionId != null ? sessionId : "unknown");

                org.json.JSONObject message = new org.json.JSONObject();
                message.put("topic", "live-screencasts");
                message.put("event", "frame");
                message.put("payload", payload);

                org.json.JSONArray messages = new org.json.JSONArray();
                messages.put(message);

                org.json.JSONObject body = new org.json.JSONObject();
                body.put("messages", messages);

                byte[] out = body.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
                conn.getOutputStream().write(out);

                int responseCode = conn.getResponseCode();
                if (responseCode >= 400) {
                    new Handler(Looper.getMainLooper()).post(() -> 
                        android.widget.Toast.makeText(getApplicationContext(), "Broadcast HTTP Error: " + responseCode, android.widget.Toast.LENGTH_SHORT).show()
                    );
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Failed to broadcast to Supabase via HTTP", e);
                final String msg = e.getMessage();
                new Handler(Looper.getMainLooper()).post(() -> 
                    android.widget.Toast.makeText(getApplicationContext(), "Upload Error: " + msg, android.widget.Toast.LENGTH_SHORT).show()
                );
            } finally {
                isUploading = false;
            }
        });
    }

    private void sendHeartbeat() {
        if (supabaseUrl == null || supabaseUrl.isEmpty() || supabaseAnonKey == null || supabaseAnonKey.isEmpty() || sessionId == null || sessionId.isEmpty()) {
            return;
        }

        executor.execute(() -> {
            try {
                // We use PATCH to update end_time to current time in Postgres
                java.net.URL url = new java.net.URL(supabaseUrl + "/rest/v1/earn_sessions?id=eq." + sessionId);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PATCH");
                conn.setRequestProperty("apikey", supabaseAnonKey);
                conn.setRequestProperty("Authorization", "Bearer " + supabaseAnonKey);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setDoOutput(true);

                // Get current UTC ISO timestamp
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US);
                sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                String now = sdf.format(new java.util.Date());

                org.json.JSONObject payload = new org.json.JSONObject();
                payload.put("end_time", now);
                payload.put("status", "completed"); // Mark as completed (or ongoing) to indicate activity

                byte[] out = payload.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
                conn.getOutputStream().write(out);

                int responseCode = conn.getResponseCode();
                if (responseCode >= 400) {
                    Log.e(TAG, "Heartbeat failed with code " + responseCode);
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Failed to send heartbeat", e);
            }
        });
    }

    private void stopRecording() {
        if (handler != null) {
            if (captureRunnable != null) handler.removeCallbacks(captureRunnable);
            if (heartbeatRunnable != null) handler.removeCallbacks(heartbeatRunnable);
        }
        if (virtualDisplay != null) {
            virtualDisplay.release();
        }
        if (imageReader != null) {
            imageReader.close();
        }
        if (mediaProjection != null) {
            mediaProjection.stop();
        }
        stopForeground(true);
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Screen Capture Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
