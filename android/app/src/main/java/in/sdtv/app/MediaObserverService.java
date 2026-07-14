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

    @Override
    public void onCreate() {
        super.onCreate();
        mediaSessionManager = (MediaSessionManager) getSystemService(Context.MEDIA_SESSION_SERVICE);

        sessionsChangedListener = controllers -> {
            updateCurrentMedia(controllers);
            for (MediaController controller : controllers) {
                controller.registerCallback(new MediaController.Callback() {
                    @Override
                    public void onMetadataChanged(MediaMetadata metadata) {
                        super.onMetadataChanged(metadata);
                        updateMetadata(metadata);
                    }

                    @Override
                    public void onPlaybackStateChanged(PlaybackState state) {
                        super.onPlaybackStateChanged(state);
                        currentPlaybackState = state;
                    }
                });
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
            updateCurrentMedia(controllers);
            mediaSessionManager.addOnActiveSessionsChangedListener(sessionsChangedListener, componentName);
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
    }

    private void updateCurrentMedia(List<MediaController> controllers) {
        if (controllers != null && !controllers.isEmpty()) {
            // Take the first active controller (usually the one playing)
            MediaController activeController = controllers.get(0);
            updateMetadata(activeController.getMetadata());
            currentPlaybackState = activeController.getPlaybackState();
        }
    }

    private void updateMetadata(MediaMetadata metadata) {
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
