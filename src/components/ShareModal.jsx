import { useState, useEffect } from 'react'

export default function ShareModal({ isOpen, onClose, shareData }) {
  const [copied, setCopied] = useState(false)

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !shareData) return null

  const { title, url, thumbnail } = shareData
  const textMsg = `Watch ${title} on Omisha and the Inner Path! \n\n${url}`
  const encodedText = encodeURIComponent(textMsg)

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 2C6.51 2 2.032 6.477 2.032 11.996c0 1.763.46 3.486 1.332 5l-1.325 4.836 4.952-1.3c1.464.814 3.12 1.243 4.84 1.243 5.517 0 9.995-4.475 9.995-9.993 0-5.518-4.478-9.993-9.995-9.993m-.032 17.585c-1.492 0-2.956-.4-4.24-1.16l-.305-.18-3.153.826.84-3.072-.196-.312a8.318 8.318 0 01-1.272-4.472C3.774 7.37 7.424 3.72 12.015 3.72c4.59 0 8.328 3.737 8.328 8.332.016 4.594-3.722 8.328-8.312 8.328zM16.58 13.56c-.256-.13-1.495-.738-1.728-.823-.232-.085-.402-.13-.57.13-.17.258-.654.823-.8 1.015-.148.192-.296.216-.554.088-.256-.13-1.066-.393-2.03-1.25-.75-.668-1.258-1.495-1.407-1.752-.147-.258-.015-.397.113-.526.115-.116.257-.302.384-.45.13-.153.17-.258.257-.432.086-.174.043-.326-.02-.456-.065-.13-.572-1.38-.783-1.89-.206-.497-.417-.43-.57-.438h-.487c-.173 0-.455.065-.694.326-.237.258-.916.892-.916 2.176 0 1.284.938 2.527 1.068 2.7.13.172 1.84 2.808 4.455 3.937.623.27 1.11.432 1.488.552.625.197 1.196.17 1.644.103.5-.075 1.496-.61 1.708-1.203.21-.592.21-1.1.147-1.203-.06-.102-.23-.16-.486-.288z"/>
        </svg>
      ),
      bg: 'bg-[#25D366] hover:bg-[#128C7E]',
      url: `https://api.whatsapp.com/send?text=${encodedText}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.197 21.5h4.152V12h3.104l.436-3.21H13.35V7.48c0-.776.223-1.503 1.256-1.503h2.125V3.136C16.364 3.09 15.116 3 13.916 3c-2.825 0-4.719 1.688-4.719 4.908v2.882H6.5v3.21h2.697v9.5z"/>
        </svg>
      ),
      bg: 'bg-[#1877F2] hover:bg-[#1664D9]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`Watch ${title}`)}`
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-3.085-8.54l6.985-2.905c.822-.338 1.545-.077 1.268.892l-2.072 7.766c-.22.956-.78.14-1.21-.194l-3.344-2.464-1.614 1.554c-.178.178-.328.328-.673.328l.24-3.414 6.21-5.61c.27-.24-.06-.37-.417-.13l-7.674 4.832-3.313-1.037c-.72-.224-.735-.72.15-1.066z"/>
        </svg>
      ),
      bg: 'bg-[#0088cc] hover:bg-[#0077b3]',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Watch ${title}`)}`
    },
    {
      name: 'Twitter (X)',
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bg: 'bg-black hover:bg-gray-800 border border-gray-700',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`
    }
  ]

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const response = await fetch(thumbnail, { mode: 'cors' })
          const blob = await response.blob()
          const textBlob = new Blob([textMsg], { type: 'text/plain' })
          const item = new ClipboardItem({
            [blob.type || 'image/jpeg']: blob,
            'text/plain': textBlob
          })
          await navigator.clipboard.write([item])
        } catch (e) {
          // If image copy fails, just copy text
          await navigator.clipboard.writeText(textMsg)
        }
      } else {
        await navigator.clipboard.writeText(textMsg)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy', error)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative w-full sm:w-[450px] bg-[#1a1a1a] sm:rounded-2xl rounded-t-3xl border sm:border-gray-800 border-t-gray-800 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#222]">
          <h3 className="text-lg font-bold text-white tracking-wide">Share this Epic</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Preview */}
          <div className="flex gap-4 mb-6 p-3 bg-black/50 rounded-xl border border-gray-800">
            <img src={thumbnail} alt="thumbnail" className="w-20 h-24 object-cover rounded-lg shadow-md" />
            <div className="flex flex-col justify-center overflow-hidden">
              <p className="text-[#FF9933] text-xs font-bold uppercase tracking-wider mb-1">Omisha and the Inner Path</p>
              <p className="text-white font-bold text-base line-clamp-2 leading-snug">{title}</p>
            </div>
          </div>

          {/* Social Icons Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-2 group"
                onClick={onClose}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform transform group-hover:scale-110 shadow-lg ${link.bg}`}>
                  {link.icon}
                </div>
                <span className="text-xs text-gray-400 font-medium group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          {/* Copy Link Button */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl transition-all border border-gray-700 group"
          >
            {copied ? (
              <>
                <span className="text-green-400">✓</span>
                <span className="text-green-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-300 font-bold group-hover:text-white transition-colors">Copy Link & Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
