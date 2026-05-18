import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

function BottomNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [avatar, setAvatar] = useState(null)

  // Listen to profile updates (using storage event and custom interval for reactive updates)
  useEffect(() => {
    const loadAvatar = () => {
      const savedAvatar = localStorage.getItem('profileAvatar')
      setAvatar(savedAvatar)
    }
    loadAvatar()

    // Refresh avatar every second to keep it responsive to edits on the Account page
    const interval = setInterval(loadAvatar, 1000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-t border-[#FF9933]/15 px-4 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Shorts Option */}
      <button
        onClick={() => navigate('/shorts')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          isActive('/shorts') ? 'text-[#FF9933] scale-110' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 12a7 7 0 1 1-7-7 7 7 0 0 1 7 7zm-7-5a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm-1 3.5v3l2.5-1.5z" />
          <path d="M4 10h2v4H4zm14 0h2v4h-2zM10 3h4v2h-4zm0 16h4v2h-4z" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider">Shorts</span>
      </button>

      {/* Music Option */}
      <button
        onClick={() => navigate('/music')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          isActive('/music') ? 'text-[#FF9933] scale-110' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider">Music</span>
      </button>

      {/* Home (Accented Center Button) */}
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center justify-center -translate-y-4 w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9933] to-[#FF6600] text-black shadow-[0_0_25px_rgba(255,153,51,0.45)] hover:shadow-[0_0_35px_rgba(255,153,51,0.65)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-[#0a0a0a]`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </button>

      {/* About Us Option */}
      <button
        onClick={() => navigate('/about')}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          isActive('/about') ? 'text-[#FF9933] scale-110' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider">About</span>
      </button>

      {/* Account Option */}
      <button
        onClick={() => navigate('/account')}
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
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
        <span className="text-[10px] font-bold tracking-wider">Account</span>
      </button>

    </div>
  )
}

export default BottomNavbar
