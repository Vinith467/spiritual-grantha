import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleLinkButton() {
  const [status, setStatus] = useState("idle");
  const { updateProfile, setAdminStatus } = useAuth();
  const [hasGoogleLinked, setHasGoogleLinked] = useState(() => !!localStorage.getItem("profileEmail"));

  useEffect(() => {
    // Load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  async function handleGoogleLogin() {
    setStatus("signing");
    try {
      if (!window.google) {
        throw new Error("Google script not loaded yet");
      }
      if (!CLIENT_ID) {
        throw new Error("Google Client ID is missing. Check your environment variables.");
      }
      
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setStatus("error");
            return;
          }
          await fetchUserInfoAndVerify(tokenResponse.access_token);
        },
      });
      client.requestAccessToken();
    } catch (err) {
      console.error("Google Login initialization failed:", err);
      setStatus("error");
    }
  }

  async function fetchUserInfoAndVerify(accessToken) {
    setStatus("subscribing");
    let isUserAdmin = false;
    try {
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (userRes.ok) {
        const userInfo = await userRes.json();
        const email = userInfo.email?.toLowerCase();
        
        // Auto-populate local profile with their real Google Account info!
        updateProfile({
          name: userInfo.name || 'Sadhaka',
          email: email || '',
          avatar: userInfo.picture || null
        });

        // Security check: Verify if they match the admin google accounts list
        const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        
        let role = 'User';
        if (email && ADMIN_EMAILS.includes(email)) {
          setAdminStatus(true);
          isUserAdmin = true;
          role = 'Admin';
        } else {
          setAdminStatus(false);
        }

        // Upsert profile in Supabase to keep real devotee profileSynced!
        try {
          await supabase.from('profiles').upsert([
            {
              email: email,
              name: userInfo.name || 'Sadhaka',
              avatar_url: userInfo.picture || '',
              role: role,
              last_login: new Date().toISOString()
            }
          ], { onConflict: 'email' })
        } catch (dbErr) {
          console.error("Failed to sync devotee profile in Supabase:", dbErr);
        }
      }
    } catch (err) {
      console.error("Error retrieving Google user details:", err);
    }

    // Attempt auto-subscribe to YouTube channel unless admin
    if (!isUserAdmin) {
      try {
        await fetch(
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
                  channelId: 'UCzoylpvmDX_HoaBkgl4FTUQ', // HARDCODED NEW CHANNEL
                },
              },
            }),
          }
        );
      } catch (subErr) {
        console.warn("YouTube auto-subscribe failed, but linking will proceed:", subErr);
      }
    }

    setHasGoogleLinked(true);
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  }

  if (hasGoogleLinked && status !== "success") {
    return (
      <div className="w-full flex items-center justify-between p-4 bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-xl">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#FF9933]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-white">Google Account Linked</p>
            <p className="text-xs text-gray-400">Your profile is safely backed up.</p>
          </div>
        </div>
        <span className="text-[#4CAF50] font-black">✓</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {status === "error" && (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 text-center">
          <p className="text-red-400 text-sm font-semibold">Something went wrong. Please try again.</p>
        </div>
      )}
      
      {status === "success" && (
        <div className="w-full bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-xl p-3 mb-3 text-center">
          <p className="text-[#4CAF50] text-sm font-semibold">Successfully Linked Google Account!</p>
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={status === "subscribing" || status === "signing"}
        className="w-full relative group flex items-center justify-center gap-3 bg-white text-gray-900 py-3 sm:py-4 px-6 rounded-xl font-extrabold text-[14px] sm:text-base transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:hover:scale-100"
      >
        {status === "subscribing" || status === "signing" ? (
          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span className="text-gray-900 font-extrabold relative z-10">
          {status === "signing" || status === "subscribing" ? "Linking Account..." : "Link Google Account"}
        </span>
      </button>
      <p className="text-center text-[10px] text-gray-500 mt-2">Optional: Backup your profile and unlock cross-device sync.</p>
    </div>
  );
}
