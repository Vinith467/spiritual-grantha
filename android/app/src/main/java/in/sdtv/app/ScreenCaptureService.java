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

    // TODO: We need to pass these from React via Intent, or hardcode them if testing
    private String supabaseUrl = "https://obweikuiqjeymihrbodv.supabase.co"; // Based on your previous queries
    private String supabaseAnonKey = ""; // Will be updated later
    private String sessionId = "test-session"; 

    @Override
    public void onCreate() {
        super.onCreate();
        projectionManager = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                int resultCode = intent.getIntExtra(EXTRA_RESULT_CODE, 0);
                Intent resultData = intent.getParcelableExtra(EXTRA_RESULT_DATA);
                // Extract keys if passed from React (will implement later)
                if (intent.hasExtra("SUPABASE_ANON_KEY")) {
                    supabaseAnonKey = intent.getStringExtra("SUPABASE_ANON_KEY");
                    sessionId = intent.getStringExtra("SESSION_ID");
                }
                startRecording(resultCode, resultData);
            } else if (ACTION_STOP.equals(action)) {
                stopRecording();
            }
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

        startForeground(NOTIFICATION_ID, notification);

        mediaProjection = projectionManager.getMediaProjection(resultCode, resultData);

        WindowManager windowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics metrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(metrics);
        int mWidth = metrics.widthPixels;
        int mHeight = metrics.heightPixels;
        int mDensity = metrics.densityDpi;

        imageReader = ImageReader.newInstance(mWidth, mHeight, PixelFormat.RGBA_8888, 2);

        virtualDisplay = mediaProjection.createVirtualDisplay("ScreenCapture",
                mWidth, mHeight, mDensity,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                imageReader.getSurface(), null, null);

        captureRunnable = new Runnable() {
            @Override
            public void run() {
                captureAndUploadFrame();
                handler.postDelayed(this, 10000); // Capture every 10 seconds
            }
        };
        handler.postDelayed(captureRunnable, 1000); // Start after 1 second
    }

    private void captureAndUploadFrame() {
        Image image = null;
        try {
            image = imageReader.acquireLatestImage();
            if (image != null) {
                Image.Plane[] planes = image.getPlanes();
                ByteBuffer buffer = planes[0].getBuffer();
                int pixelStride = planes[0].getPixelStride();
                int rowStride = planes[0].getRowStride();
                int rowPadding = rowStride - pixelStride * image.getWidth();

                Bitmap bitmap = Bitmap.createBitmap(image.getWidth() + rowPadding / pixelStride,
                        image.getHeight(), Bitmap.Config.ARGB_8888);
                bitmap.copyPixelsFromBuffer(buffer);

                // Compress heavily to save bandwidth (e.g., 20% quality)
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 20, bos);
                byte[] bitmapData = bos.toByteArray();
                String base64Frame = "data:image/jpeg;base64," + Base64.encodeToString(bitmapData, Base64.NO_WRAP);

                uploadToSupabase(base64Frame);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error capturing frame", e);
        } finally {
            if (image != null) {
                image.close();
            }
        }
    }

    private void uploadToSupabase(String base64Frame) {
        Intent intent = new Intent("ScreenCaptureFrame");
        intent.putExtra("frame_base64", base64Frame);
        androidx.localbroadcastmanager.content.LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
    }

    private void stopRecording() {
        if (handler != null && captureRunnable != null) {
            handler.removeCallbacks(captureRunnable);
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
