import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  // Initialize values directly to avoid synchronous setState inside useEffect which causes an extra render
  const [isIOS] = useState(() => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()))
  const [isStandalone, setIsStandalone] = useState(() => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone)

  useEffect(() => {
    // If already logged in, take them straight to the app feed
    if (localStorage.getItem('subscribed') === 'true') {
      navigate('/home', { replace: true })
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Optional: detect when installed
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
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
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="Sanatan Dharma TV Logo" className="w-9 h-9 rounded-full border border-[#FF9933]/50 shadow-[0_0_12px_rgba(255,153,51,0.2)]" />
          <div>
            <span className="text-[#FF9933] font-black text-sm sm:text-base tracking-tight">Sanatan Dharma</span>
            <span className="text-white font-black text-sm sm:text-base tracking-tight"> Television</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-[#FF9933] to-[#FF6600] px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(255,153,51,0.3)]"
        >
          Sign In
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-2xl mx-auto w-full relative z-10">
        
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border border-[#FF9933]/30 overflow-hidden mb-8 shadow-[0_0_50px_rgba(255,153,51,0.2)] p-1 bg-black">
          <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-cover rounded-2xl" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
          Install the App
        </h1>
        <p className="text-gray-300 text-base sm:text-lg mb-10 max-w-md">
          To get the best experience, please install our premium spiritual streaming platform directly on your device.
        </p>

        {isStandalone ? (
           <div className="w-full p-6 bg-green-500/10 border border-green-500/20 rounded-2xl mb-8 flex flex-col items-center">
             <span className="text-4xl block mb-2">🎉</span>
             <h2 className="text-xl font-bold text-green-400 mb-2">App Installed!</h2>
             <p className="text-gray-300 text-sm mb-6">You can now proceed to sign in and enjoy the content.</p>
             <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-10 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
             >
                Continue to Sign In
             </button>
           </div>
        ) : isIOS ? (
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
               <button
                 onClick={handleInstallClick}
                 className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold text-lg px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(255,153,51,0.3)] hover:shadow-[0_0_40px_rgba(255,153,51,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-6"
               >
                 Install App Now
               </button>
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
