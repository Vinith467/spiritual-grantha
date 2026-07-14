package in.sdtv.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.projection.MediaProjectionManager;
import android.os.Build;

import androidx.activity.result.ActivityResult;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ScreenCapture")
public class ScreenCapturePlugin extends Plugin {

    private MediaProjectionManager mediaProjectionManager;
    private BroadcastReceiver frameReceiver;

    @Override
    public void load() {
        mediaProjectionManager = (MediaProjectionManager) getContext().getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        frameReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent != null && intent.hasExtra("frame_base64")) {
                    String base64 = intent.getStringExtra("frame_base64");
                    JSObject ret = new JSObject();
                    ret.put("frame", base64);
                    notifyListeners("onFrame", ret);
                }
            }
        };
        LocalBroadcastManager.getInstance(getContext()).registerReceiver(frameReceiver, new IntentFilter("ScreenCaptureFrame"));
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (frameReceiver != null) {
            LocalBroadcastManager.getInstance(getContext()).unregisterReceiver(frameReceiver);
        }
    }

    @PluginMethod()
    public void startRecording(PluginCall call) {
        saveCall(call);
        Intent screenCaptureIntent = mediaProjectionManager.createScreenCaptureIntent();
        startActivityForResult(call, screenCaptureIntent, "handleScreenCaptureResult");
    }

    @PluginMethod()
    public void stopRecording(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), ScreenCaptureService.class);
        serviceIntent.setAction(ScreenCaptureService.ACTION_STOP);
        getContext().startService(serviceIntent);
        call.resolve();
    }

    @ActivityCallback
    private void handleScreenCaptureResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        int resultCode = result.getResultCode();
        Intent data = result.getData();

        if (resultCode == Activity.RESULT_OK && data != null) {
            Intent serviceIntent = new Intent(getContext(), ScreenCaptureService.class);
            serviceIntent.setAction(ScreenCaptureService.ACTION_START);
            serviceIntent.putExtra(ScreenCaptureService.EXTRA_RESULT_CODE, resultCode);
            serviceIntent.putExtra(ScreenCaptureService.EXTRA_RESULT_DATA, data);
            
            PluginCall savedCall = getSavedCall();
            if (savedCall != null) {
                serviceIntent.putExtra("SESSION_ID", savedCall.getString("SESSION_ID", ""));
                serviceIntent.putExtra("EMAIL", savedCall.getString("EMAIL", ""));
                serviceIntent.putExtra("SUPABASE_URL", savedCall.getString("SUPABASE_URL", ""));
                serviceIntent.putExtra("SUPABASE_ANON_KEY", savedCall.getString("SUPABASE_ANON_KEY", ""));
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(serviceIntent);
            } else {
                getContext().startService(serviceIntent);
            }
            call.resolve(new JSObject().put("status", "started"));
        } else {
            call.reject("Screen capture permission denied.");
        }
    }
}
