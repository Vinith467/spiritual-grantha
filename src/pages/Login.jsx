import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CLIENT_ID =
  "778407955821-lsjr8ffc36l94s4goorttq8ou52dk4i4.apps.googleusercontent.com";
const CHANNEL_ID = "UCNIsckaXm3JOTRrmhQVGD2g";

function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [hoverZone, setHoverZone] = useState("none");

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const [onboardingData, setOnboardingData] = useState({
    displayName: "",
    phone: "",
    dharmaPath: "",
    contentPreference: [],
    sacredTime: "",
    language: ""
  });

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
      navigate("/home", { replace: true });
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
  }

  async function fetchUserInfoAndVerify(accessToken) {
    setStatus("subscribing");
    let isUserAdmin = false;
    let emailAddress = "";
    try {
      // 1. Fetch user info from Google OAuth2 API
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userRes.ok) {
        const userInfo = await userRes.json();
        const email = userInfo.email?.toLowerCase();
        emailAddress = email;
        
        // Auto-populate local profile with their real Google Account info!
        if (userInfo.name) localStorage.setItem("profileName", userInfo.name);
        if (userInfo.picture) localStorage.setItem("profileAvatar", userInfo.picture);
        if (email) localStorage.setItem("profileEmail", email);

        // Security check: Verify if they match the admin google accounts list
        const ADMIN_EMAILS = [
          "vinuvinith0007@gmail.com"
        ];
        
        let role = 'User';
        if (email && ADMIN_EMAILS.includes(email)) {
          localStorage.setItem("isAdmin", "true");
          isUserAdmin = true;
          role = 'Admin';
        } else {
          localStorage.setItem("isAdmin", "false");
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

    // 2. Perform YouTube check or Admin bypass
    if (isUserAdmin) {
      // Admin bypasses subscription check entirely!
      localStorage.setItem("subscribed", "true");
      localStorage.removeItem("clickedYouTube");
      handleLoginSuccess(emailAddress);
    } else {
      await subscribeToChannel(accessToken, emailAddress);
    }
  }

  async function subscribeToChannel(accessToken, emailAddress) {
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
        localStorage.setItem("subscribed", "true");
        localStorage.removeItem("clickedYouTube");
        handleLoginSuccess(emailAddress);
      } else {
        // Fallback: If YouTube API returns an error
        localStorage.setItem("subscribed", "true");
        localStorage.removeItem("clickedYouTube");
        handleLoginSuccess(emailAddress);
      }
    } catch {
      // Fallback on network/fetch errors
      localStorage.setItem("subscribed", "true");
      localStorage.removeItem("clickedYouTube");
      handleLoginSuccess(emailAddress);
    }
  }



  // -------------------------------------------------------------
  // ONBOARDING HANDLERS
  // -------------------------------------------------------------
  function handleLoginSuccess(email) {
    const finalEmail = email || localStorage.getItem("profileEmail") || "";
    setUserEmail(finalEmail);
    setShowOnboarding(true);
  }

  const handleContentPreferenceToggle = (item) => {
    setOnboardingData(prev => {
      const exists = prev.contentPreference.includes(item);
      const updated = exists 
        ? prev.contentPreference.filter(p => p !== item)
        : [...prev.contentPreference, item];
      return { ...prev, contentPreference: updated };
    });
  };

  const handleSkipOrComplete = async () => {
    // Save to Supabase silently in background
    try {
      const email = userEmail || localStorage.getItem("profileEmail");
      if (email) {
        // Sync local storage immediately to welcome them!
        if (onboardingData.displayName) {
          localStorage.setItem("profileName", onboardingData.displayName);
        }
        if (onboardingData.phone) {
          localStorage.setItem("profileContact", onboardingData.phone);
        }

        await supabase.from('profiles').update({
          display_name: onboardingData.displayName || null,
          phone: onboardingData.phone || null,
          dharma_path: onboardingData.dharmaPath || null,
          content_preference: onboardingData.contentPreference.length > 0 ? onboardingData.contentPreference : null,
          sacred_time: onboardingData.sacredTime || null,
          language: onboardingData.language || null
        }).eq('email', email.toLowerCase());
      }
    } catch (err) {
      console.error("Silent save onboarding failed:", err);
    }
    navigate("/home", { replace: true });
  };

  // -------------------------------------------------------------
  // RENDERING ONBOARDING SCREEN
  // -------------------------------------------------------------
  if (showOnboarding) {
    const stepsBackground = [
      "/assets/ram_sita.webp",        // Step 1
      "/assets/vishnu_lakshmi.webp",  // Step 2
      "/assets/vishnu_lakshmi.webp",  // Step 3
      "/assets/krishna_arjuna.webp",   // Step 4
      "/assets/krishna_radha.webp",   // Step 5
      "/assets/ram_sita.webp"         // Step 6
    ];

    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#0a0a0a] text-white selection:bg-[#FF9933]/30 font-sans overflow-x-hidden">
        
        {/* Dynamic Spiritual Cinematic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a]">
          <img 
            src={stepsBackground[currentStep - 1]} 
            alt="Dharmic Background" 
            className="absolute inset-0 w-full h-full object-cover object-top opacity-25 transition-all duration-1000 ease-out mix-blend-screen scale-100" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/90 to-[#0a0a0a]"></div>
        </div>

        {/* Floating Top Controls (Progress Indicator and Skip Button) */}
        <div className="relative z-20 w-full max-w-lg mx-auto px-6 pt-8 flex items-center justify-between">
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    s === currentStep 
                      ? "w-6 bg-gradient-to-r from-[#FF9933] to-[#FF6600]" 
                      : s < currentStep 
                        ? "w-2.5 bg-[#FF9933]/60" 
                        : "w-1.5 bg-white/20"
                  }`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-black tracking-wider text-gray-500 uppercase">
              Step {currentStep} of 6
            </span>
          </div>

          {/* Skip Button */}
          <button 
            onClick={handleSkipOrComplete}
            className="text-xs font-extrabold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 transition active:scale-95"
          >
            Skip Journey
          </button>
        </div>

        {/* Central Card container with full glassmorphism */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 w-full max-w-lg mx-auto">
          
          <div className="w-full bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] min-h-[380px] flex flex-col justify-between">
            
            {/* STEP 1: Name Personalization */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-3xl inline-block mb-2">🙏</span>
                  <h2 className="text-[#FF9933] text-sm font-black tracking-widest uppercase mb-1">Jai Shri Ram</h2>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">What should we call you?</h1>
                </div>
                <div className="space-y-2">
                  <input 
                    type="text"
                    required
                    placeholder="Enter your first name only..."
                    value={onboardingData.displayName}
                    onChange={(e) => setOnboardingData({ ...onboardingData, displayName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#FF9933] rounded-2xl px-5 py-4 text-center text-lg font-bold outline-none text-white transition placeholder-gray-600"
                  />
                  <p className="text-xs text-gray-500 text-center font-medium leading-relaxed">
                    This is just so we can greet you personally inside the television platform.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Mobile Number */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-3xl inline-block mb-2">📱</span>
                  <h2 className="text-[#FF9933] text-sm font-black tracking-widest uppercase mb-1">Contact Details</h2>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">What is your mobile number?</h1>
                </div>
                <div className="space-y-2">
                  <input 
                    type="tel"
                    required
                    placeholder="Enter your contact number..."
                    value={onboardingData.phone}
                    onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#FF9933] rounded-2xl px-5 py-4 text-center text-lg font-bold outline-none text-white transition placeholder-gray-600"
                  />
                  <p className="text-xs text-gray-500 text-center font-medium leading-relaxed">
                    This lets us verify your devotee membership privileges securely.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: Dharma Path Motivations */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1">Your Dharma Path</h2>
                  <h1 className="text-xl sm:text-2xl font-black text-white">What brings you to Sanatan Dharma?</h1>
                </div>
                <div className="space-y-2">
                  {[
                    "🔱 I want to know my roots",
                    "📖 I want to learn the scriptures",
                    "🎵 I seek peace through devotion",
                    "👨‍👩‍👧 I want my family to know our culture",
                    "✨ I am already on the path, want more"
                  ].map((path) => (
                    <button
                      key={path}
                      onClick={() => {
                        setOnboardingData({ ...onboardingData, dharmaPath: path });
                        // Smooth auto transition
                        setTimeout(() => setCurrentStep(4), 250);
                      }}
                      className={`w-full text-left px-5 py-3 rounded-xl border text-sm font-bold transition duration-300 flex items-center justify-between ${
                        onboardingData.dharmaPath === path
                          ? "bg-gradient-to-r from-[#FF9933]/20 to-[#FF6600]/20 border-[#FF9933] text-[#FF9933]"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300"
                      }`}
                    >
                      <span>{path}</span>
                      {onboardingData.dharmaPath === path && <span className="text-[#FF9933] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Content Preference */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1">Content Preference</h2>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Which stories call to your soul?</h1>
                  <p className="text-[10px] text-gray-500 mt-1">Select all that apply (minimum 1)</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Ramayan",
                    "Mahabharat",
                    "Bhagwat Geeta",
                    "Shiv Puran",
                    "Hanuman Katha",
                    "Devotional Music"
                  ].map((pref) => {
                    const isSelected = onboardingData.contentPreference.includes(pref);
                    return (
                      <button
                        key={pref}
                        onClick={() => handleContentPreferenceToggle(pref)}
                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition duration-300 text-center flex items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-gradient-to-r from-[#FF9933]/20 to-[#FF6600]/20 border-[#FF9933] text-[#FF9933]"
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${
                          isSelected ? "bg-[#FF9933] border-[#FF9933] text-black" : "border-white/20"
                        }`}>
                          {isSelected && "✓"}
                        </span>
                        <span>{pref}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Sacred Time */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1">Your Sacred Time</h2>
                  <h1 className="text-xl sm:text-2xl font-black text-white">When do you connect with the divine?</h1>
                </div>
                <div className="space-y-2">
                  {[
                    "🌅 Early morning (Brahma Muhurta)",
                    "☀️ During the day",
                    "🌆 Evening prayers time",
                    "🌙 Late night silence"
                  ].map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setOnboardingData({ ...onboardingData, sacredTime: time });
                        setTimeout(() => setCurrentStep(6), 250);
                      }}
                      className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-bold transition duration-300 flex items-center justify-between ${
                        onboardingData.sacredTime === time
                          ? "bg-gradient-to-r from-[#FF9933]/20 to-[#FF6600]/20 border-[#FF9933] text-[#FF9933]"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300"
                      }`}
                    >
                      <span>{time}</span>
                      {onboardingData.sacredTime === time && <span className="text-[#FF9933] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Language Selection */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1">Language Comfort</h2>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Choose your experience language</h1>
                </div>
                <div className="space-y-2">
                  {[
                    "🇮🇳 Hindi",
                    "🌺 Kannada",
                    "🌴 Telugu",
                    "🌸 Tamil",
                    "🔵 English"
                  ].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setOnboardingData({ ...onboardingData, language: lang })}
                      className={`w-full text-left px-5 py-3 rounded-xl border text-sm font-bold transition duration-300 flex items-center justify-between ${
                        onboardingData.language === lang
                          ? "bg-gradient-to-r from-[#FF9933]/20 to-[#FF6600]/20 border-[#FF9933] text-[#FF9933]"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300"
                      }`}
                    >
                      <span>{lang}</span>
                      {onboardingData.language === lang && <span className="text-[#FF9933] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-bold text-xs transition active:scale-95"
                >
                  Back
                </button>
              )}
              
              <button
                disabled={
                  (currentStep === 1 && onboardingData.displayName.trim() === "") ||
                  (currentStep === 2 && onboardingData.phone.trim() === "") ||
                  (currentStep === 3 && onboardingData.dharmaPath === "") ||
                  (currentStep === 4 && onboardingData.contentPreference.length === 0) ||
                  (currentStep === 5 && onboardingData.sacredTime === "") ||
                  (currentStep === 6 && onboardingData.language === "")
                }
                onClick={() => {
                  if (currentStep < 6) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    handleSkipOrComplete();
                  }
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(255,153,51,0.2)] hover:shadow-[0_0_30px_rgba(255,153,51,0.4)] transition active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
              >
                {currentStep === 6 ? "Begin My Journey ✨" : "Continue"}
              </button>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD SIGN-IN SCREEN
  // -------------------------------------------------------------
  return (
    <div 
      className="relative min-h-screen w-full flex flex-col bg-[#0a0a0a] overflow-x-hidden selection:bg-[#FF9933]/30"
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
      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[100dvh]">
        
        {/* Top Header & Center Content */}
        <div className="flex flex-col items-center w-full mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#FF9933]/30 shadow-[0_0_50px_rgba(255,153,51,0.15)] mb-4 sm:mb-6 ring-4 ring-black/50 shrink-0">
            <img
              src="/icon-192.png"
              alt="Grantha"
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-[#FF9933] to-[#FF6600] text-4xl sm:text-5xl md:text-5xl font-black tracking-tighter text-center whitespace-nowrap mb-1 drop-shadow-lg shrink-0">
            Sanatan Dharma
          </h1>
          <h2 className="text-white text-2xl sm:text-3xl md:text-3xl font-extrabold tracking-tight text-center mb-3 sm:mb-4 shrink-0">
            Television
          </h2>
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#FF9933]/60"></div>
            <p className="text-[#FF9933] text-sm sm:text-base font-medium tracking-wide text-center drop-shadow-md">
              धर्मो रक्षति रक्षितः
            </p>
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#FF9933]/60"></div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          <p className="text-gray-300 text-sm sm:text-base text-center mb-6 leading-relaxed font-medium px-2 shrink-0">
            Sign in with Google to unlock free access to all spiritual content.
          </p>

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
          <div className="w-full space-y-3 shrink-0">
            <button
              onClick={handleGoogleLogin}
              disabled={status === "subscribing"}
              className="group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:scale-[0.98] transition-all duration-300 px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] disabled:opacity-70 disabled:active:scale-100"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-gray-800 font-bold text-sm sm:text-base md:text-lg">
                {status === "signing" ? "Opening Google..." : "Continue with Google"}
              </span>
            </button>

          </div>

          {/* Footer */}
          <div className="w-full text-center mt-8 shrink-0 space-y-3">
            <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium tracking-wide">
              Free forever. One time Google Sign in only.
            </p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-600 font-semibold tracking-wider uppercase">
              <a href="/privacy" className="hover:text-[#FF9933] hover:underline transition">Privacy Policy</a>
              <span className="text-gray-800">•</span>
              <a href="/terms" className="hover:text-[#FF9933] hover:underline transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
