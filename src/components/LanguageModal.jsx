import { useEffect } from 'react'

const availableLanguages = [
  { code: 'en', en: 'English', native: 'English' },
  { code: 'hi', en: 'Hindi', native: 'हिंदी' },
  { code: 'bn', en: 'Bengali', native: 'বাংলা' },
  { code: 'te', en: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', en: 'Marathi', native: 'मराठी' },
  { code: 'ta', en: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', en: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', en: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', en: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', en: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', en: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', en: 'Assamese', native: 'অসমীয়া' },
  { code: 'sa', en: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'ur', en: 'Urdu', native: 'اردو' },
  { code: 'ne', en: 'Nepali', native: 'नेपाली' },
  { code: 'mai', en: 'Maithili', native: 'मैथिली' },
  { code: 'bho', en: 'Bhojpuri', native: 'भोजपुरी' },
  { code: 'doi', en: 'Dogri', native: 'डोगरी' },
  { code: 'gom', en: 'Konkani', native: 'कोंकणी' },
  { code: 'sd', en: 'Sindhi', native: 'سنڌي' }
]

export default function LanguageModal({ isOpen, onClose, selectedLang, onLanguageChange }) {
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

  if (!isOpen) return null

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
          <h3 className="text-lg font-bold text-white tracking-wide">Choose Language</h3>
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
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar notranslate">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onLanguageChange(lang.code);
                onClose();
              }}
              className={`w-full flex justify-between items-center px-6 py-4 transition-colors hover:bg-white/5 border-b border-white/5 last:border-none ${selectedLang === lang.code ? 'bg-[#FF9933]/10' : ''}`}
            >
              <span className={`font-bold tracking-wide text-lg ${selectedLang === lang.code ? 'text-white' : 'text-gray-400'}`}>{lang.en}</span>
              <span className={`font-extrabold text-xl ${selectedLang === lang.code ? 'text-[#FF9933]' : 'text-gray-500'}`}>{lang.native}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
