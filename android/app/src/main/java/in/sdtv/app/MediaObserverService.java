package in.sdtv.app;

import android.content.ComponentName;
import android.content.Context;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.media.session.PlaybackState;
import android.os.Handler;
import android.os.Looper;
import android.service.notification.NotificationListenerService;
import android.util.Log;

import java.util.List;

public class MediaObserverService extends NotificationListenerService {

    private static final String TAG = "MediaObserverService";
    
    // Global static variables for easy access from ScreenCaptureService
    public static String currentVideoTitle = "";
    public static long currentVideoDuration = 0;
    public static PlaybackState currentPlaybackState = null;

    private MediaSessionManager mediaSessionManager;
    private MediaSessionManager.OnActiveSessionsChangedListener sessionsChangedListener;
    private Handler handler;
    private Runnable pollingRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        mediaSessionManager = (MediaSessionManager) getSystemService(Context.MEDIA_SESSION_SERVICE);
        handler = new Handler(Looper.getMainLooper());

        sessionsChangedListener = controllers -> {
            registerCallbacks(controllers);
            updateCurrentMedia(controllers);
        };
        
        // Bulletproof polling: check active sessions every 2 seconds in case callbacks drop
        pollingRunnable = new Runnable() {
            @Override
            public void run() {
                try {
                    ComponentName componentName = new ComponentName(MediaObserverService.this, MediaObserverService.class);
                    List<MediaController> controllers = mediaSessionManager.getActiveSessions(componentName);
                    updateCurrentMedia(controllers);
                } catch (Exception e) {
                    Log.e(TAG, "Polling failed", e);
                }
                handler.postDelayed(this, 2000);
            }
        };
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.i(TAG, "NotificationListenerService connected!");
        try {
            ComponentName componentName = new ComponentName(this, MediaObserverService.class);
            List<MediaController> controllers = mediaSessionManager.getActiveSessions(componentName);
            registerCallbacks(controllers);
            updateCurrentMedia(controllers);
            mediaSessionManager.addOnActiveSessionsChangedListener(sessionsChangedListener, componentName);
            handler.postDelayed(pollingRunnable, 2000); // Start polling
        } catch (SecurityException e) {
            Log.e(TAG, "Missing permission to listen to active sessions", e);
        }
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        if (mediaSessionManager != null && sessionsChangedListener != null) {
            mediaSessionManager.removeOnActiveSessionsChangedListener(sessionsChangedListener);
        }
        if (handler != null && pollingRunnable != null) {
            handler.removeCallbacks(pollingRunnable);
        }
    }
    
    private void registerCallbacks(List<MediaController> controllers) {
        if (controllers == null) return;
        for (MediaController controller : controllers) {
            // Only care about YouTube
            if (!"com.google.android.youtube".equals(controller.getPackageName())) {
                continue;
            }
            controller.registerCallback(new MediaController.Callback() {
                @Override
                public void onMetadataChanged(MediaMetadata metadata) {
                    super.onMetadataChanged(metadata);
                    updateMetadata(metadata, controller.getPlaybackState());
                }

                @Override
                public void onPlaybackStateChanged(PlaybackState state) {
                    super.onPlaybackStateChanged(state);
                    updateMetadata(controller.getMetadata(), state);
                }
            });
        }
    }

    private void updateCurrentMedia(List<MediaController> controllers) {
        if (controllers != null && !controllers.isEmpty()) {
            MediaController mostRecentController = null;
            long mostRecentTime = -1;
            
            for (MediaController controller : controllers) {
                if ("com.google.android.youtube".equals(controller.getPackageName())) {
                    PlaybackState state = controller.getPlaybackState();
                    if (state != null) {
                        // The active session is the one that was most recently updated by the system
                        long updateTime = state.getLastPositionUpdateTime();
                        
                        // We also give a massive priority boost if it's actively PLAYING or BUFFERING
                        if (state.getState() == PlaybackState.STATE_PLAYING || state.getState() == PlaybackState.STATE_BUFFERING) {
                            updateTime += 1000000000L; // Artificial boost to ensure playing/buffering wins
                        }
                        
                        if (updateTime > mostRecentTime) {
                            mostRecentTime = updateTime;
                            mostRecentController = controller;
                        }
                    } else if (mostRecentController == null) {
                        mostRecentController = controller;
                    }
                }
            }
            
            if (mostRecentController != null) {
                updateMetadata(mostRecentController.getMetadata(), mostRecentController.getPlaybackState());
            }
        }
    }

    private void updateMetadata(MediaMetadata metadata, PlaybackState state) {
        if (state != null) {
            currentPlaybackState = state;
        }
        
        if (metadata != null) {
            String title = metadata.getString(MediaMetadata.METADATA_KEY_TITLE);
            long duration = metadata.getLong(MediaMetadata.METADATA_KEY_DURATION); // in milliseconds
            
            if (title != null && !title.isEmpty()) {
                currentVideoTitle = title;
            }
            if (duration > 0) {
                currentVideoDuration = duration;
            }
            Log.d(TAG, "Current Media: " + currentVideoTitle + " (Duration: " + currentVideoDuration + "ms)");
        }
    }
}
