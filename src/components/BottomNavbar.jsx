import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PlaySquareOutlined, CustomerServiceOutlined, HomeFilled, GlobalOutlined, UserOutlined } from '@ant-design/icons'
import { haptics } from '../utils/haptics'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import LanguageModal from './LanguageModal'

function BottomNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [avatar, setAvatar] = useState(null)
  const [showLangModal, setShowLangModal] = useState(false)
  const { selectedLang, handleLanguageChange } = useGoogleTranslate()

  // Listen for profile updates via custom events (no more polling)
  useEffect(() => {
    const loadAvatar = () => {
      const savedAvatar = localStorage.getItem('profileAvatar')
      setAvatar(savedAvatar)
    }
    loadAvatar()

    // React to profile changes from AuthContext or other tabs
    window.addEventListener('profileUpdated', loadAvatar)
    window.addEventListener('storage', loadAvatar)
    return () => {
      window.removeEventListener('profileUpdated', loadAvatar)
      window.removeEventListener('storage', loadAvatar)
    }
  }, [])

  const isActive = (path) => location.pathname === path

  const handleNav = (path) => {
    haptics.selection()
    navigate(path)
  }

  return (
    <>
      <LanguageModal 
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        selectedLang={selectedLang}
        onLanguageChange={handleLanguageChange}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-t border-[#FF9933]/15 px-4 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Shorts Option */}
      <button
        onClick={() => handleNav('/shorts')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          isActive('/shorts') ? 'text-[#FF9933] scale-110' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <PlaySquareOutlined className="text-[24px]" />
        <span className="text-[10px] font-bold tracking-wider">Shorts</span>
      </button>

      {/* Music Option */}
      <button
        onClick={() => handleNav('/music')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          isActive('/music') ? 'text-[#FF9933] scale-110' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <CustomerServiceOutlined className="text-[24px]" />
        <span className="text-[10px] font-bold tracking-wider">Music</span>
      </button>

      {/* Home (Accented Center Button) */}
      <button
        onClick={() => handleNav('/home')}
        className={`flex flex-col items-center justify-center -translate-y-4 w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9933] to-[#FF6600] text-black shadow-[0_0_25px_rgba(255,153,51,0.45)] hover:shadow-[0_0_35px_rgba(255,153,51,0.65)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-[#0a0a0a]`}
      >
        <HomeFilled className="text-[24px]" />
      </button>

      {/* Language Option */}
      <button
        onClick={() => {
          haptics.selection()
          setShowLangModal(true)
        }}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          showLangModal ? 'text-[#FF9933] scale-110' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <GlobalOutlined className="text-[24px]" />
        <span className="text-[10px] font-bold tracking-wider">Language</span>
      </button>

      {/* Account Option */}
      <button
        onClick={() => handleNav('/account')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          isActive('/account') ? 'text-[#FF9933] scale-110' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Profile"
            className={`w-6 h-6 rounded-full object-cover border-2 ${
              isActive('/account') ? 'border-[#FF9933]' : 'border-gray-500'
            }`}
          />
        ) : (
          <UserOutlined className="text-[24px]" />
        )}
        <span className="text-[10px] font-bold tracking-wider">Account</span>
      </button>

      </div>
    </>
  )
}

export default BottomNavbar
