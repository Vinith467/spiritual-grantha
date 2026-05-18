import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavbar from '../components/BottomNavbar'
import Navbar from '../components/Navbar'

function Account() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle', 'saving', 'saved'

  // Load profile data from localStorage
  useEffect(() => {
    setName(localStorage.getItem('profileName') || 'Devotee')
    setContact(localStorage.getItem('profileContact') || '')
    setAvatar(localStorage.getItem('profileAvatar') || null)
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
  }, [])

  // Handle avatar upload and convert to base64
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save profile to localStorage
  const handleSave = (e) => {
    e.preventDefault()
    setSaveStatus('saving')
    
    setTimeout(() => {
      localStorage.setItem('profileName', name)
      localStorage.setItem('profileContact', contact)
      if (avatar) {
        localStorage.setItem('profileAvatar', avatar)
      }
      setSaveStatus('saved')
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    }, 800)
  }

  // Sign out / Reset subscription
  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('subscribed')
      localStorage.removeItem('isAdmin')
      window.location.href = '/login'
    }
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      {/* Top Navbar */}
      <Navbar />

      <div className="px-4 sm:px-6 pt-24 max-w-md mx-auto">
        <div className="bg-black/40 backdrop-blur-md border border-[#FF9933]/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          <span className="bg-[#FF9933]/15 border border-[#FF9933]/20 px-3 py-1 rounded-full text-[10px] font-bold text-[#FF9933] uppercase tracking-widest inline-block mb-6">
            Profile Settings
          </span>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Profile Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#FF9933] shadow-[0_0_20px_rgba(255,153,51,0.25)] mb-3">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#1f1f1f] flex items-center justify-center text-gray-400">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                
                {/* Upload Hover Overlay */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer">
                  <svg className="w-6 h-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] text-white font-extrabold uppercase">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-400 text-xs font-semibold">Tap to update avatar picture</p>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#FF9933] uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300"
                placeholder="Enter your name"
              />
            </div>

            {/* Contact Number Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#FF9933] uppercase tracking-wider block">Contact Number</label>
              <input
                type="tel"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300"
                placeholder="Enter contact number"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold text-sm py-3.5 rounded-xl transition duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75"
            >
              {saveStatus === 'saving' && (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              {saveStatus === 'saved' ? 'Saved Successfully! 🙏' : 'Save Profile Settings'}
            </button>

          </form>

          {/* Sign Out Section */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Membership Status</p>
              <p className="text-sm font-extrabold text-[#FF9933]">Premium Devotee</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>

          {/* Admin Dashboard Entry (Visible only to authenticated Admin Google Accounts) */}
          {isAdmin && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex justify-between items-center bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-2xl p-4">
                <div>
                  <p className="text-xs text-[#FF9933] font-black uppercase tracking-wider">Privilege Level</p>
                  <p className="text-sm font-bold text-white">System Admin</p>
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-[#FF9933] hover:bg-[#FF6600] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition duration-300 active:scale-95 shadow-[0_0_15px_rgba(255,153,51,0.25)] border border-[#FF9933]/50"
                >
                  Admin Panel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Bottom Navbar */}
      <BottomNavbar />
    </div>
  )
}

export default Account
