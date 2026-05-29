import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  // Initialize values directly to avoid synchronous setState inside useEffect which causes an extra render
  const [isIOS] = useState(() => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()))

  useEffect(() => {
    // If already logged in, take them straight to the app feed
    if (localStorage.getItem('subscribed') === 'true') {
      navigate('/home', { replace: true })
      return
    }

    // If opened as a standalone PWA, take them directly to login
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      navigate('/login', { replace: true })
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Detect when installed and automatically redirect to login
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      navigate('/login', { replace: true })
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [navigate])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    // Show the install prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white selection:bg-[#FF9933]/30 flex flex-col relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-orange-950/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-[#FF9933]/10 px-5 sm:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <img src="/icon-192.png" alt="Sanatan Dharma TV Logo" className="w-9 h-9 rounded-full border border-[#FF9933]/50 shadow-[0_0_12px_rgba(255,153,51,0.2)]" />
          <div>
            <span className="text-[#FF9933] font-black text-sm sm:text-base tracking-tight">Sanatan Dharma</span>
            <span className="text-white font-black text-sm sm:text-base tracking-tight"> Television</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-2xl mx-auto w-full relative z-10">
        
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border border-[#FF9933]/30 overflow-hidden mb-8 shadow-[0_0_50px_rgba(255,153,51,0.2)] p-1 bg-black mx-auto">
          <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-cover rounded-2xl" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
          Install the App
        </h1>
        <p className="text-gray-300 text-base sm:text-lg mb-10 max-w-md mx-auto">
          To get the best experience, please install our premium spiritual streaming platform directly on your device.
        </p>

        {isIOS ? (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 text-left relative overflow-hidden shadow-2xl">
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
             
             <div className="mt-8 pt-5 border-t border-white/10">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-center text-xs font-bold text-[#FF9933] hover:text-[#FF6600] transition"
                >
                  I've already installed the app / Continue to Sign In →
                </button>
             </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {deferredPrompt ? (
              <div className="w-full flex flex-col items-center animate-bounce-slow">
                {/* Visual indicator / pointing text */}
                <p className="text-[#FF9933] font-black text-sm sm:text-base uppercase tracking-widest mb-4 flex items-center gap-2 animate-pulse">
                  Click Below to Install Instantly 
                </p>
                
                {/* Giant, highly attractive pulsing install button */}
                <div className="relative group w-full sm:w-auto">
                  {/* Outer pulsing glow background layer */}
                  <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#FF6600] opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                  
                  <button
                    onClick={handleInstallClick}
                    className="relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-black text-xl px-16 py-6 rounded-2xl shadow-[0_0_50px_rgba(255,153,51,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 mb-2 select-none border-2 border-white/20"
                  >
                    {/* SVG Mobile App Install Icon */}
                    <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                      onClick={() => navigate('/login')}
                      className="text-xs font-bold text-[#FF9933] hover:text-[#FF6600] transition"
                    >
                      Skip installation and Sign In →
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
