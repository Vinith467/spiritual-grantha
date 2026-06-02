import { useState, useRef, useEffect } from 'react';

const availableLanguages = [
  { code: 'en', en: 'English', native: 'English' },
  { code: 'hi', en: 'Hindi', native: 'हिंदी' },
  { code: 'kn', en: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', en: 'Bengali', native: 'বাংলা' },
  { code: 'te', en: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', en: 'Marathi', native: 'मराठी' },
  { code: 'ta', en: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', en: 'Gujarati', native: 'ગુજરાતી' },
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
];

export default function LanguageSelector({ selectedLang, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = availableLanguages.find(l => l.code === selectedLang) || availableLanguages[0];

  return (
    <div className="relative w-full notranslate" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300 font-bold text-gray-300 flex justify-between items-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between w-full pr-4 items-center">
          <span className="text-gray-300">{selected.en}</span>
          <span className="text-[#FF9933] text-base">{selected.native}</span>
        </div>
        <svg className={`w-4 h-4 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-[#FF9933]/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-64 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex justify-between items-center px-4 py-3 text-sm transition-colors hover:bg-white/5 border-b border-white/5 last:border-none ${selectedLang === lang.code ? 'bg-[#FF9933]/10' : ''}`}
            >
              <span className={`font-bold tracking-wide ${selectedLang === lang.code ? 'text-white' : 'text-gray-400'}`}>{lang.en}</span>
              <span className={`font-extrabold text-base ${selectedLang === lang.code ? 'text-[#FF9933]' : 'text-gray-500'}`}>{lang.native}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
