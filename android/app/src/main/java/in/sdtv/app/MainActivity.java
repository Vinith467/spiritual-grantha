package in.sdtv.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Thread.setDefaultUncaughtExceptionHandler(new CrashHandler(this));
        
        // Show crash log if exists
        android.content.SharedPreferences prefs = getSharedPreferences("CrashLogs", android.content.Context.MODE_PRIVATE);
        String lastCrash = prefs.getString("last_crash", null);
        if (lastCrash != null) {
            android.util.Log.e("SpiritualGranthaCrash", "Previous Crash:\n" + lastCrash);
            android.widget.Toast.makeText(this, "Previous Crash Logged in Logcat", android.widget.Toast.LENGTH_LONG).show();
            // We can't easily show a huge stack trace in a Toast, so we'll just alert the first few lines
            String shortCrash = lastCrash.length() > 200 ? lastCrash.substring(0, 200) : lastCrash;
            android.app.AlertDialog dialog = new android.app.AlertDialog.Builder(this)
                .setTitle("Previous Crash")
                .setMessage(shortCrash)
                .setPositiveButton("OK", null)
                .create();
            dialog.show();
            prefs.edit().remove("last_crash").commit();
        }
        registerPlugin(ScreenCapturePlugin.class);
    }
}
