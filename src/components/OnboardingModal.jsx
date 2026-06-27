import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { haptics } from '../utils/haptics'

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Only show once
    const hasSeen = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeen) {
      // Small delay to let home page load first
      const timer = setTimeout(() => {
        setIsOpen(true)
        if (profile?.name && profile.name !== 'Devotee' && profile.name !== 'Sadhaka') {
          setName(profile.name)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [profile])

  const handleSave = () => {
    haptics.selection()
    if (name.trim()) {
      updateProfile({ name: name.trim() })
    }
    closeModal()
  }

  const handleGoToAccount = () => {
    haptics.selection()
    if (name.trim()) {
      updateProfile({ name: name.trim() })
    }
    closeModal()
    navigate('/account')
  }

  const closeModal = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(255,153,51,0.15)] relative overflow-hidden flex flex-col items-center text-center animate-[slideUp_0.4s_ease-out]">
        
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF9933]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9933] to-[#FF6600] p-1 mb-4 shadow-[0_0_20px_rgba(255,153,51,0.3)]">
          <div className="w-full h-full bg-[#141414] rounded-full flex items-center justify-center overflow-hidden">
            <img src="/icon-192.png" alt="Omisha Logo" className="w-full h-full object-cover scale-110" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white mb-2">Welcome to Omisha</h2>
        <p className="text-gray-400 text-sm mb-6">What should we call you?</p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF9933] transition-colors text-center mb-6"
        />

        <p className="text-xs text-gray-500 mb-6">
          You can fill out the remaining details in your account profile whenever you want.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-transform"
          >
            Start Watching
          </button>
          <button
            onClick={handleGoToAccount}
            className="w-full bg-white/5 text-white font-semibold py-3 rounded-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
          >
            Go to Account Profile
          </button>
        </div>
      </div>
    </div>
  )
}
