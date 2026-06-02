import os

with open('src/pages/Account.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

share_qr_html = """              {/* Share & QR Options */}
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

# Remove it from its current position
content = content.replace(share_qr_html, "")

# Modify it to have a top border since it's going below the form
new_share_qr_html = """
          {/* Share & QR Options */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10 relative z-50">
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

target_html = """          </form>

          {/* Google Link Section */}"""

content = content.replace(target_html, "          </form>" + new_share_qr_html + "\n          {/* Google Link Section */}")

with open('src/pages/Account.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Moved Share & QR Option")
