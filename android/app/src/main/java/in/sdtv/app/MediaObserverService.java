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
            registerCallbacks(controllers);
            updateCurrentMedia(controllers);
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
    
    private void registerCallbacks(List<MediaController> controllers) {
        if (controllers == null) return;
        for (MediaController controller : controllers) {
            controller.registerCallback(new MediaController.Callback() {
                @Override
                public void onMetadataChanged(MediaMetadata metadata) {
                    super.onMetadataChanged(metadata);
                    if (controller.getPlaybackState() != null) {
                        int state = controller.getPlaybackState().getState();
                        if (state == PlaybackState.STATE_PLAYING || state == PlaybackState.STATE_BUFFERING) {
                            updateMetadata(metadata, controller.getPlaybackState());
                        }
                    }
                }

                @Override
                public void onPlaybackStateChanged(PlaybackState state) {
                    super.onPlaybackStateChanged(state);
                    if (state != null) {
                        int stateCode = state.getState();
                        if (stateCode == PlaybackState.STATE_PLAYING || stateCode == PlaybackState.STATE_BUFFERING) {
                            updateMetadata(controller.getMetadata(), state);
                        }
                    }
                }
            });
        }
    }

    private void updateCurrentMedia(List<MediaController> controllers) {
        if (controllers != null && !controllers.isEmpty()) {
            // Try to find the one that is currently playing or buffering
            MediaController activeController = controllers.get(0);
            for (MediaController controller : controllers) {
                PlaybackState state = controller.getPlaybackState();
                if (state != null) {
                    int stateCode = state.getState();
                    if (stateCode == PlaybackState.STATE_PLAYING || stateCode == PlaybackState.STATE_BUFFERING) {
                        activeController = controller;
                        break;
                    }
                }
            }
            updateMetadata(activeController.getMetadata(), activeController.getPlaybackState());
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
