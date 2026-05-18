import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CLIENT_ID =
  "778407955821-lsjr8ffc36l94s4goorttq8ou52dk4i4.apps.googleusercontent.com";
const CHANNEL_ID = "UCNIsckaXm3JOTRrmhQVGD2g";

function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [cameBack, setCameBack] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("subscribed") === "true") {
      navigate("/", { replace: true });
    }

    if (localStorage.getItem("clickedYouTube") === "true") {
      setCameBack(true);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        if (localStorage.getItem("clickedYouTube") === "true") {
          setCameBack(true);
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [navigate]);

  function handleYouTubeSubscribe() {
    localStorage.setItem("clickedYouTube", "true");
    window.open(
      "https://www.youtube.com/@Vinu_s_shetty467?sub_confirmation=1",
      "_blank",
    );
  }

  async function handleGoogleLogin() {
    setStatus("signing");
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/youtube",
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          setStatus("error");
          return;
        }
        await subscribeToChannel(tokenResponse.access_token);
      },
    });
    client.requestAccessToken();
  }

  async function subscribeToChannel(accessToken) {
    setStatus("subscribing");
    try {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              resourceId: {
                kind: "youtube#channel",
                channelId: CHANNEL_ID,
              },
            },
          }),
        },
      );
      if (res.status === 200 || res.status === 409) {
        localStorage.setItem("subscribed", "true");
        localStorage.removeItem("clickedYouTube");
        navigate("/", { replace: true });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleContinue() {
    localStorage.setItem("subscribed", "true");
    localStorage.removeItem("clickedYouTube");
    navigate("/", { replace: true });
  }

  return (
    <div className="bg-[#141414] min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-yellow-500 text-4xl font-extrabold tracking-wider mb-1">
        Sanatan Dharma Television
      </h1>
      <p className="text-gray-400 text-sm mb-8">Stream the Eternal</p>

      <div className="bg-[#1f1f1f] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/5">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500/50 mb-3">
            <img
              src="/icon-192.png"
              alt="Grantha"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white font-bold text-lg text-center">
            Welcome to Sanatan Dharma Television
          </h2>
          <p className="text-gray-400 text-xs text-center mt-1 leading-relaxed">
            Subscribe to our YouTube channel to unlock free access to all
            spiritual content
          </p>
        </div>

        {/* Subscribing spinner */}
        {status === "subscribing" && (
          <div className="flex items-center justify-center gap-2 mb-4 text-yellow-500 text-sm">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            Subscribing...
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-400 text-xs">
              Something went wrong. Try again.
            </p>
          </div>
        )}

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleLogin}
          disabled={status === "subscribing"}
          className="w-full bg-white hover:bg-gray-100 active:scale-95 text-gray-800 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {status === "signing" ? "Opening Google..." : "Subscribe with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* YouTube button */}
        <button
          onClick={handleYouTubeSubscribe}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Subscribe on YouTube
        </button>

        {/* Came back — show Watch Now */}
        {cameBack && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">Welcome back!</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black py-3 rounded-xl font-bold text-sm transition-all"
            >
              I've Subscribed — Watch Now
            </button>
          </div>
        )}

        <p className="text-gray-500 text-[10px] text-center mt-4">
          Free forever for subscribers. One time only.
        </p>
      </div>
    </div>
  );
}

export default Login;
