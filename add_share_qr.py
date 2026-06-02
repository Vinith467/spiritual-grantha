import os

with open('src/pages/Account.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add showQR state
state_injection = "  const [showQR, setShowQR] = useState(false)\n"
content = content.replace("const [saveStatus, setSaveStatus] = useState('idle')", state_injection + "  const [saveStatus, setSaveStatus] = useState('idle')")

# 2. Add Share and QR Buttons
buttons_html = """              {/* Share & QR Options */}
              <div className="grid grid-cols-2 gap-3 mt-4 relative z-50">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Sanatan Dharma TV',
                        text: 'Discover the divine journey on Sanatan Dharma TV!',
                        url: 'https://sdtv.in',
                      })
                    } else {
                      navigator.clipboard.writeText('https://sdtv.in')
                      alert('Link copied to clipboard!')
                    }
                  }}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-300 flex justify-center items-center gap-2 transition duration-300 shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share App
                </button>
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-300 flex justify-center items-center gap-2 transition duration-300 shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  App QR Code
                </button>
              </div>

"""
about_us_html = """              {/* About Us Link */}
              <div className="space-y-1 relative z-50">"""

content = content.replace(about_us_html, buttons_html + about_us_html)

# 3. Add Modal HTML before BottomNavbar
modal_html = """      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-[#FF9933]/30 rounded-3xl p-8 max-w-[320px] w-full text-center relative shadow-[0_0_50px_rgba(255,153,51,0.2)] animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full p-1.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FF9933]/10 border border-[#FF9933]/20">
               <svg className="w-6 h-6 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
               </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-wide">Scan to Install</h3>
            <p className="text-xs text-gray-400 mb-6 px-2 leading-relaxed">Scan this code with any phone camera to instantly open and install the app.</p>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://sdtv.in" alt="App QR Code" className="w-44 h-44" />
            </div>
            <div className="mt-6 flex justify-center">
              <span className="bg-[#FF9933]/15 text-[#FF9933] px-4 py-1.5 rounded-full font-bold tracking-widest uppercase text-[10px] border border-[#FF9933]/20">sdtv.in</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navbar */}"""

content = content.replace("      {/* Floating Bottom Navbar */}", modal_html)

with open('src/pages/Account.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Account.jsx with Share and QR options")
