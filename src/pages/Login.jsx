import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { Capacitor } from '@capacitor/core';
import { useGoogleTranslate } from "../lib/useGoogleTranslate";
import LanguageSelector from "../components/LanguageSelector";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [hoverZone, setHoverZone] = useState("none");
  const [nativeEmail, setNativeEmail] = useState("");
  const { selectedLang, handleLanguageChange } = useGoogleTranslate();



  const { signIn, setAdminStatus, updateProfile } = useAuth();

  const handleMouseMove = (e) => {
    const { clientX } = e;
    const width = window.innerWidth;
    if (clientX < width / 4) {
      setHoverZone("zone1");
    } else if (clientX < (width * 2) / 4) {
      setHoverZone("zone2");
    } else if (clientX < (width * 3) / 4) {
      setHoverZone("zone3");
    } else {
      setHoverZone("zone4");
    }
  };

  const handleMouseLeave = () => {
    setHoverZone("none");
  };

  useEffect(() => {
    if (localStorage.getItem("subscribed") === "true") {
      const lastPath = localStorage.getItem('last_path') || "/home";
      navigate(lastPath, { replace: true });
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [navigate]);

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
      // 1. Fetch user info from Google OAuth2 API
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
        const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
          
        const hardcodedAdmins = [
          'vinuvinith0007@gmail.com',
          'omishamarketingfaculty@gmail.com',
          'lakshmikanthng2@gmail.com'
        ];
        
        const ADMIN_EMAILS = [...envAdmins, ...hardcodedAdmins];
        
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
      } else {
        throw new Error("Failed to get user info from Google");
      }
    } catch (err) {
      console.error("fetchUserInfoAndVerify failed:", err);
      setStatus("error");
    }

    // 2. Perform YouTube check or Admin bypass
    if (isUserAdmin) {
      // Admin bypasses subscription check entirely!
      signIn();
      localStorage.removeItem("clickedYouTube");
      handleLoginSuccess();
    } else {
      await subscribeToChannel(accessToken);
    }
  }

  async function handleNativeLogin(e) {
    e.preventDefault();
    if (!nativeEmail) return;
    setStatus("subscribing");
    
    try {
      const email = nativeEmail.toLowerCase().trim();
      let isUserAdmin = false;
      const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
        
      const hardcodedAdmins = [
        'vinuvinith0007@gmail.com',
        'omishamarketingfaculty@gmail.com',
        'lakshmikanthng2@gmail.com'
      ];
      
      const ADMIN_EMAILS = [...envAdmins, ...hardcodedAdmins];
      
      if (ADMIN_EMAILS.includes(email)) {
        setAdminStatus(true);
        isUserAdmin = true;
      } else {
        setAdminStatus(false);
      }

      updateProfile({
        name: 'Devotee',
        email: email,
        avatar: null
      });

      await supabase.from('profiles').upsert([
        {
          email: email,
          name: 'Devotee',
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'email' });

      signIn();
      navigate("/home");
    } catch (err) {
      console.error("Native login failed:", err);
      setStatus("error");
    }
  }

  async function subscribeToChannel(accessToken) {
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
      
      // Successfully subscribed OR already subscribed (409 Conflict)
      if (res.status === 200 || res.status === 409) {
        signIn();
        localStorage.removeItem("clickedYouTube");
        handleLoginSuccess();
      } else {
        // Fallback: If YouTube API returns an error (e.g. user has no YT channel)
        console.warn('YouTube subscription failed with status:', res.status, '- Granting fallback access');
        signIn();
        localStorage.removeItem("clickedYouTube");
        handleLoginSuccess();
      }
    } catch (err) {
      // Fallback on network/fetch errors
      console.warn('YouTube subscription network error:', err, '- Granting fallback access');
      signIn();
      localStorage.removeItem("clickedYouTube");
      handleLoginSuccess();
    }
  }

  function handleLoginSuccess() {
    signIn();
    const lastPath = localStorage.getItem('last_path') || "/home";
    navigate(lastPath, { replace: true });
  }

  // -------------------------------------------------------------
  // STANDARD SIGN-IN SCREEN
  // -------------------------------------------------------------
  return (
    <div 
      className="fixed inset-0 md:relative md:inset-auto w-full h-[100dvh] md:h-auto md:min-h-[100dvh] flex flex-col bg-[#0a0a0a] overflow-hidden md:overflow-x-hidden md:overflow-y-auto selection:bg-[#FF9933]/30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Background Gods Images (Fades in based on mouse position) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a]">
        {/* Vishnu Lakshmi */}
        <img 
          src="/assets/vishnu_lakshmi.webp" 
          alt="Vishnu Lakshmi" 
          fetchpriority="high"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-out mix-blend-screen ${hoverZone === 'zone1' ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
          style={{ transformOrigin: 'center left' }}
        />
        {/* Ram Sita */}
        <img 
          src="/assets/ram_sita.webp" 
          alt="Ram Sita" 
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-out mix-blend-screen ${hoverZone === 'zone2' ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
          style={{ transformOrigin: 'center left' }}
        />
        {/* Krishna Arjuna */}
        <img 
          src="/assets/krishna_arjuna.webp" 
          alt="Krishna Arjuna" 
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-out mix-blend-screen ${hoverZone === 'zone3' ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
          style={{ transformOrigin: 'center right' }}
        />
        {/* Krishna Radha */}
        <img 
          src="/assets/krishna_radha.webp" 
          alt="Krishna Radha" 
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-out mix-blend-screen ${hoverZone === 'zone4' ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
          style={{ transformOrigin: 'center right' }}
        />
      </div>

      {/* Dynamic Background Glow */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${hoverZone !== 'none' ? 'opacity-30' : 'opacity-100'}`}>
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-orange-950/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-orange-900/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-0 left-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-orange-950/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 pb-12 pt-16 sm:pb-12 sm:pt-16 md:pt-12 flex flex-col items-center justify-end md:justify-center h-full md:min-h-screen">
        
        {/* Glass Card Container */}
        <div className="flex flex-col items-center w-full bg-white/5 backdrop-blur-sm border-t border-l border-white/40 border-b-white/10 border-r-white/10 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-4 sm:mb-8 mt-auto md:mt-0 relative overflow-hidden">
          {/* Subtle glossy shine effect inside the card */}
          <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[2rem]"></div>
          
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#FF9933]/40 shadow-[0_0_30px_rgba(255,153,51,0.2)] mb-4 sm:mb-6 ring-1 ring-white/20 shrink-0">
            <img
              src="/icon-192.png"
              alt="Grantha"
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-[#FF9933] to-[#FF6600] text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-tight text-center mb-2 drop-shadow-lg shrink-0 notranslate">
            {selectedLang === 'hi' ? (
              <>ओमिशा एंड द<br />इनर पाथ</>
            ) : (
              <>Omisha and the<br />Inner Path</>
            )}
          </h1>
          
          <div className="flex items-center justify-center w-full mb-4 sm:mb-6">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FF9933]/50 to-transparent w-12 sm:w-16"></div>
            <p className="mx-3 sm:mx-4 text-[#FF9933] font-medium text-xs sm:text-sm md:text-base tracking-widest whitespace-nowrap notranslate">
              धर्मो रक्षति रक्षितः
            </p>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FF9933]/50 to-transparent w-12 sm:w-16"></div>
          </div>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed px-1 text-center font-medium shrink-0">
            Unlock a lifetime of divine wisdom and sacred stories.<br className="hidden sm:block" />
            <span className="block mt-2 sm:mt-1 sm:inline text-gray-400">Click <strong className="text-white">Continue with Google</strong> to sign in for free and begin your journey.</span>
          </p>

          {/* Custom Language Selector Proxying Google Translate */}
          <div className="w-full mb-6 z-50 relative">
            <LanguageSelector 
              selectedLang={selectedLang} 
              onLanguageChange={handleLanguageChange} 
            />
          </div>


          {/* Status Messages */}
          {status === "subscribing" && (
            <div className="w-full bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-xl p-3 mb-4 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,153,51,0.1)] shrink-0">
              <div className="w-4 h-4 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#FF9933] text-sm font-semibold">Verifying Subscription...</span>
            </div>
          )}

          {status === "error" && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-center shadow-[0_0_20px_rgba(239,68,68,0.1)] shrink-0">
              <p className="text-red-400 text-sm font-semibold">
                Something went wrong. Please try again.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="w-full flex justify-center">
            {status === "signing" || status === "subscribing" ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 border-4 border-[#FF9933]/30 border-t-[#FF9933] rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,153,51,0.5)]"></div>
                <p className="text-[#FF9933] font-bold tracking-wide animate-pulse notranslate">
                  {status === "signing" ? "Authenticating..." : "Logging In..."}
                </p>
              </div>
            ) : Capacitor.isNativePlatform() ? (
              <form onSubmit={handleNativeLogin} className="w-full flex flex-col gap-3">
                <input 
                  type="email" 
                  required 
                  placeholder="Enter your email to login"
                  value={nativeEmail}
                  onChange={(e) => setNativeEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                />
                <button
                  type="submit"
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,153,51,0.4)] flex items-center justify-center gap-3 border border-white/20"
                >
                  <span className="relative z-10 tracking-wide uppercase">Login to App</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </form>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="w-full group relative overflow-hidden bg-white text-gray-800 px-8 py-4 rounded-2xl font-black text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 border border-gray-100"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-200 p-1">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <span className="relative z-10 tracking-wide">Continue with Google</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="w-full text-center mt-4 shrink-0 space-y-3">
            {/* Terms and Privacy */}
            <div className="mt-4 text-center text-xs font-medium">
              <div className="flex justify-center space-x-4 text-gray-500">
                <a href="/privacy" className="hover:text-white transition-colors duration-300 uppercase tracking-widest">Privacy Policy</a>
                <span className="text-gray-700">•</span>
                <a href="/terms" className="hover:text-white transition-colors duration-300 uppercase tracking-widest">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
