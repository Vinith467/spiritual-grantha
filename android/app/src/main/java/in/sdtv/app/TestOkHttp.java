package in.sdtv.app;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.MediaType;
import okhttp3.Response;

public class TestOkHttp {
    public void test() {
        OkHttpClient client = new OkHttpClient();
        RequestBody body = RequestBody.create("{}", MediaType.parse("application/json"));
        Request request = new Request.Builder().url("https://example.com").patch(body).build();
    }
}
