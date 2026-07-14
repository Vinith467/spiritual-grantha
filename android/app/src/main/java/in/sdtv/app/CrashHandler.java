package in.sdtv.app;

import android.content.Context;
import android.content.SharedPreferences;

public class CrashHandler implements Thread.UncaughtExceptionHandler {
    private Thread.UncaughtExceptionHandler defaultHandler;
    private Context context;

    public CrashHandler(Context context) {
        this.defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        this.context = context;
    }

    @Override
    public void uncaughtException(Thread thread, Throwable throwable) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("CrashLogs", Context.MODE_PRIVATE);
            String trace = android.util.Log.getStackTraceString(throwable);
            prefs.edit().putString("last_crash", trace).commit();
        } catch (Exception e) {
            // Ignore
        }
        if (defaultHandler != null) {
            defaultHandler.uncaughtException(thread, throwable);
        }
    }
}
