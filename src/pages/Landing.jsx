import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import LanguageSelector from '../components/LanguageSelector'
import { useAuth } from '../lib/AuthContext'

function Landing() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS] = useState(() => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()))
  const [hoverZone, setHoverZone] = useState("none")
  const { selectedLang, handleLanguageChange } = useGoogleTranslate()

  const handleMouseMove = (e) => {
    const { clientX } = e
    const width = window.innerWidth
    if (clientX < width / 4) {
      setHoverZone("zone1")
    } else if (clientX < (width * 2) / 4) {
      setHoverZone("zone2")
    } else if (clientX < (width * 3) / 4) {
      setHoverZone("zone3")
    } else {
      setHoverZone("zone4")
    }
  }

  const handleMouseLeave = () => {
    setHoverZone("none")
  }

  useEffect(() => {
    // If already logged in/entered app, take them straight to home feed
    if (localStorage.getItem('subscribed') === 'true') {
      signIn()
      navigate('/home', { replace: true })
      return
    }

    // If opened as a standalone PWA, take them directly to home feed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      signIn()
      navigate('/home', { replace: true })
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Detect when installed and automatically redirect to home feed
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      signIn()
      navigate('/home', { replace: true })
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [navigate, signIn])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      signIn()
      navigate('/home', { replace: true })
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    setDeferredPrompt(null)
    signIn()
    navigate('/home', { replace: true })
  }

  return (
    <div 
      className="bg-[#0a0a0a] min-h-screen text-white selection:bg-[#FF9933]/30 flex flex-col relative overflow-hidden h-[100dvh] md:h-auto md:min-h-[100dvh] md:overflow-x-hidden md:overflow-y-auto"
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

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-6 sm:py-12 text-center max-w-2xl mx-auto w-full relative z-10">
        
        <div className="w-20 h-20 sm:w-36 sm:h-36 rounded-3xl border border-[#FF9933]/30 overflow-hidden mb-4 sm:mb-8 shadow-[0_0_50px_rgba(255,153,51,0.2)] p-1 bg-black mx-auto">
          <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-cover rounded-2xl" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-2 sm:mb-4">
          Install the App
        </h1>
        <p className="text-gray-300 text-sm sm:text-lg mb-4 sm:mb-8 max-w-md mx-auto">
          To get the best experience, please install our premium spiritual streaming platform directly on your device.
        </p>

        {/* Custom Language Selector Proxying Google Translate */}
        <div className="w-full mb-4 sm:mb-8 z-50 relative max-w-sm mx-auto">
          <LanguageSelector 
            selectedLang={selectedLang} 
            onLanguageChange={handleLanguageChange} 
          />
        </div>

        {isIOS ? (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-left relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px]"></div>
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                Install on iOS (Safari)
             </h3>
             <ol className="space-y-5 text-sm sm:text-base text-gray-300">
               <li className="flex items-start gap-4">
                 <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-xs text-white border border-white/20">1</div>
                 <p className="pt-0.5">Tap the <strong className="text-white">Share</strong> icon at the bottom of Safari <span className="inline-block align-middle ml-1 p-1 bg-white/10 rounded"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span></p>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-xs text-white border border-white/20">2</div>
                 <p className="pt-0.5">Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <span className="inline-block align-middle ml-1 p-1 bg-white/10 rounded"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></span></p>
               </li>
             </ol>
             

          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {deferredPrompt ? (
              <div className="w-full flex flex-col items-center animate-bounce-slow">
                <p className="text-[#FF9933] font-black text-xs sm:text-base uppercase tracking-widest mb-3 sm:mb-4 flex items-center justify-center gap-2 animate-pulse">
                  Click Below to Install Instantly
                </p>
                
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute -inset-1 sm:-inset-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#FF6600] opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                  
                  <button
                    onClick={handleInstallClick}
                    className="relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-black text-base sm:text-xl px-8 py-3.5 sm:px-16 sm:py-6 rounded-xl sm:rounded-2xl shadow-[0_0_50px_rgba(255,153,51,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 mb-2 select-none border-2 border-white/20"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>INSTALL APP NOW</span>
                  </button>
                </div>
              </div>
            ) : (
               <div className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl mb-8 shadow-xl">
                 <div className="animate-spin w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full mx-auto mb-4"></div>
                 <p className="text-sm font-bold text-white mb-2">Preparing installation...</p>
                 <p className="text-xs text-gray-400 max-w-[250px] mx-auto">If you are using a private window or an unsupported browser, you may need to switch to Chrome.</p>
                 
                 <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        localStorage.setItem('subscribed', 'true')
                        navigate('/home', { replace: true })
                      }}
                      className="text-xs font-bold text-[#FF9933] hover:text-[#FF6600] transition"
                    >
                      Skip installation and Continue to App →
                    </button>
                 </div>
               </div>
            )}
            
            <p className="text-gray-500 text-xs font-medium">Fast, secure, and uses less than 5MB of storage.</p>
          </div>
        )}

      </main>

      <footer className="py-5 px-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-[10px] text-gray-600 max-w-3xl mx-auto w-full z-10">
        <p>© 2026 Sanatan Dharma Television.</p>
        <div className="hidden sm:block text-gray-800">•</div>
        <div className="flex items-center gap-4 uppercase tracking-wider font-semibold">
          <a href="/privacy" className="hover:text-[#FF9933] transition">Privacy Policy</a>
          <span className="text-gray-800">•</span>
          <a href="/terms" className="hover:text-[#FF9933] transition">Terms</a>
        </div>
      </footer>

    </div>
  )
}

export default Landing
