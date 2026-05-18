import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  // If already logged in, take them straight to the app feed
  useEffect(() => {
    if (localStorage.getItem('subscribed') === 'true') {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white selection:bg-[#FF9933]/30 flex flex-col">

      {/* SEO & Accessibility */}
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
          className="text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-[#FF9933] to-[#FF6600] px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(255,153,51,0.3)]"
        >
          Sign In
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-3xl mx-auto w-full">

        {/* Hero Icon */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#FF9933]/50 overflow-hidden mb-8 shadow-[0_0_40px_rgba(255,153,51,0.25)]">
          <img src="/icon-192.png" alt="Sanatan Dharma TV" className="w-full h-full object-cover" />
        </div>

        {/* App Name — must EXACTLY match Google Cloud app name */}
        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
          <span className="text-[#FF9933]">Sanatan Dharma</span>
          <br />
          <span className="text-white">Television</span>
        </h1>
        <p className="text-[#FF9933] text-sm sm:text-base font-semibold mb-6 tracking-widest uppercase">
          धर्मो रक्षति रक्षितः
        </p>

        {/* Purpose Statement (Required by Google) */}
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          A premium, free spiritual streaming platform dedicated to Hindu scriptures, devotional epics, sacred music, and vedic wisdom — accessible to every devoted soul.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-10">
          {[
            { icon: '📺', label: 'Sacred Epics', desc: 'Ramayana, Mahabharata & more' },
            { icon: '🎵', label: 'Devotional Music', desc: 'Bhajans, Stotras & Chants' },
            { icon: '📱', label: 'Divine Shorts', desc: 'TikTok-style spiritual reels' },
            { icon: '📖', label: 'Vedic Wisdom', desc: 'Gita shlokas & teachings' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-left hover:border-[#FF9933]/30 transition">
              <span className="text-2xl block mb-1">{item.icon}</span>
              <p className="text-white font-bold text-xs sm:text-sm">{item.label}</p>
              <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Data Collection Transparency (Required by Google) */}
        <div className="w-full bg-[#FF9933]/5 border border-[#FF9933]/15 rounded-2xl p-5 mb-8 text-left">
          <h2 className="text-sm font-black text-[#FF9933] uppercase tracking-wider mb-3">How We Use Your Google Account</h2>
          <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#FF9933] mt-0.5 shrink-0">✓</span>
              <span><strong className="text-gray-200">YouTube Subscription Verification</strong> — We verify you are subscribed to our YouTube channel to grant free access to all content.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF9933] mt-0.5 shrink-0">✓</span>
              <span><strong className="text-gray-200">Profile Auto-Population</strong> — Your Google name and profile picture are used to personalize your dashboard experience.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF9933] mt-0.5 shrink-0">✓</span>
              <span><strong className="text-gray-200">We never sell your data</strong> — Your information is stored only on your device (browser localStorage) and is never shared with third parties.</span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold text-base px-10 py-4 rounded-2xl shadow-[0_0_30px_rgba(255,153,51,0.3)] hover:shadow-[0_0_40px_rgba(255,153,51,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-4"
        >
          Start Watching Free — Subscribe with Google
        </button>
        <p className="text-gray-600 text-xs">Free forever for YouTube subscribers. No payment required.</p>
      </main>

      {/* Footer with Privacy Policy Link (Required by Google) */}
      <footer className="border-t border-white/5 py-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-600 max-w-3xl mx-auto w-full">
        <p>© 2026 Sanatan Dharma Television. All rights reserved.</p>
        <div className="flex items-center gap-4 font-semibold uppercase tracking-wider">
          <a href="/privacy" className="hover:text-[#FF9933] transition">Privacy Policy</a>
          <span className="text-gray-800">•</span>
          <a href="/terms" className="hover:text-[#FF9933] transition">Terms of Service</a>
          <span className="text-gray-800">•</span>
          <a href="/about" className="hover:text-[#FF9933] transition">About Us</a>
        </div>
      </footer>

    </div>
  )
}

export default Landing
