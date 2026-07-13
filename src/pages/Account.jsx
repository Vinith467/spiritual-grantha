import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import BottomNavbar from '../components/BottomNavbar'
import { InfoCircleOutlined } from '@ant-design/icons'
import Navbar from '../components/Navbar'

function formatMinsToHours(mins) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

const getLocalYMD = (d = new Date()) => {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const offset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
}

function Account() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [name, setName] = useState(localStorage.getItem('profileName') || 'Devotee')
  const [contact, setContact] = useState(localStorage.getItem('profileContact') || '')
  const [avatar, setAvatar] = useState(localStorage.getItem('profileAvatar') || null)
  const [isAdmin] = useState(localStorage.getItem('isAdmin') === 'true')
  const [profileEmail] = useState(localStorage.getItem('profileEmail') || '')
  
  // Personalization States
  const [displayName, setDisplayName] = useState('')
  const [dharmaPath, setDharmaPath] = useState('')
  const [contentPreference, setContentPreference] = useState([])
  const [sacredTime, setSacredTime] = useState('')
  const { selectedLang, handleLanguageChange } = useGoogleTranslate()

    const [showQR, setShowQR] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle', 'saving', 'saved', 'error'
  
  // Watch Time States
  const [todayWatchMins, setTodayWatchMins] = useState(0)
  const [allTimeWatchMins, setAllTimeWatchMins] = useState(0)

  // Load profile data from Supabase
  useEffect(() => {
    // Load rich personalization direct from Supabase
    const email = profileEmail;
    if (email) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email.toLowerCase())
            .single()
          
          if (!error && data) {
            if (data.name) {
              setName(data.name)
              localStorage.setItem('profileName', data.name)
            }
            if (data.display_name) {
              setDisplayName(data.display_name)
              // If display name is present, greet them with it!
              localStorage.setItem('profileName', data.display_name)
              setName(data.display_name)
            }
            if (data.phone) {
              setContact(data.phone)
              localStorage.setItem('profileContact', data.phone)
            }
            if (data.avatar_url) {
              setAvatar(data.avatar_url)
              localStorage.setItem('profileAvatar', data.avatar_url)
            }
            if (data.dharma_path) setDharmaPath(data.dharma_path)
            if (Array.isArray(data.content_preference)) setContentPreference(data.content_preference)
            if (data.sacred_time) setSacredTime(data.sacred_time)
          }
        } catch (err) {
          console.error("Error retrieving Supabase devotee profile:", err)
        }
      }
      fetchProfile()
      
      const fetchWatchTime = async () => {
        try {
          const { data, error } = await supabase
            .from('video_views')
            .select('duration_seconds, viewed_at, created_at')
            .eq('user_email', email.toLowerCase())
          
          if (!error && data) {
            let allTime = 0
            let todayTime = 0
            
            const todayStr = getLocalYMD(new Date());

            data.forEach(v => {
              const mins = Math.ceil((v.duration_seconds || 0) / 60);
              allTime += mins;
              
              const vDateStr = getLocalYMD(v.viewed_at || v.created_at);

              if (vDateStr === todayStr) {
                todayTime += mins;
              }
            })
            
            setAllTimeWatchMins(allTime)
            setTodayWatchMins(todayTime)
          }
        } catch (err) {
          console.error("Error fetching watch time:", err)
        }
      }
      fetchWatchTime()
    }
  }, [profileEmail])

  // Handle avatar upload and convert to base64
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result)
        // Notify BottomNavbar immediately
        window.dispatchEvent(new Event('profileUpdated'))
      }
      reader.readAsDataURL(file)
    }
  }

  // Toggle multi-select content preferences
  const handleContentPreferenceToggle = (item) => {
    setContentPreference(prev => {
      const exists = prev.includes(item)
      return exists ? prev.filter(p => p !== item) : [...prev, item]
    })
  }

  // Save profile to Supabase & localStorage
  const handleSave = async (e) => {
    e.preventDefault()
    setSaveStatus('saving')
    
    // Sync local storage immediately!
    localStorage.setItem('profileName', displayName || name)
    localStorage.setItem('profileContact', contact)
    if (avatar) {
      localStorage.setItem('profileAvatar', avatar)
    }
    // Notify other components (e.g. BottomNavbar) of profile changes
    window.dispatchEvent(new Event('profileUpdated'))

    try {
      const email = profileEmail || localStorage.getItem('profileEmail')
      if (email) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: displayName || name, // Update display name as primary greet name!
            display_name: displayName || null,
            phone: contact || null,
            avatar_url: avatar || null,
            dharma_path: dharmaPath || null,
            content_preference: contentPreference.length > 0 ? contentPreference : null,
            sacred_time: sacredTime || null
          })
          .eq('email', email.toLowerCase())

        if (error) throw error
      }
      
      setSaveStatus('saved')
    } catch (err) {
      console.error("Error saving devotee profile to Supabase:", err)
      setSaveStatus('error')
    } finally {
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    }
  }



  return (
    <div className="bg-[#141414] min-h-screen text-white pb-28">
      {/* Top Navbar */}
      <Navbar />

      <div className="px-4 sm:px-6 pt-24 max-w-lg mx-auto">
        <div className="bg-black/40 backdrop-blur-md border border-[#FF9933]/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          <div className="flex justify-between items-center mb-6">
            <span className="bg-[#FF9933]/15 border border-[#FF9933]/20 px-3.5 py-1 rounded-full text-[10px] font-bold text-[#FF9933] uppercase tracking-widest inline-block">
              My Account
            </span>
            <span className="text-[10px] text-gray-500 font-extrabold tracking-wider truncate max-w-[150px] uppercase">
              {profileEmail}
            </span>
          </div>

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

            {/* Standard Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name / Greeting Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#FF9933] uppercase tracking-wider block">Your Personal Details</label>
                <input
                  type="text"
                  required
                  value={displayName || name}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    setName(e.target.value)
                  }}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300 font-bold"
                  placeholder="What should we call you?"
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
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300 font-bold"
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            {/* 📊 Your Dharma Progress */}
            <div className="border-t border-white/10 pt-6 space-y-5">
              <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                <span>📊 Your Dharma Progress</span>
              </h3>
              
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FF9933]/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>

                {/* Today's Watch Time */}
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Watch Time</p>
                    <p className="text-[10px] text-gray-500">12 AM to 12 AM</p>
                  </div>
                  <div className="text-lg font-black text-green-400">{formatMinsToHours(todayWatchMins)}</div>
                </div>

                {/* All-Time Watch Time & Progress to 300 Hrs */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-[#FF9933] uppercase tracking-wider">Total Journey</p>
                      <p className="text-[10px] text-gray-500">Goal: 300 Hours</p>
                    </div>
                    <div className="text-lg font-black text-white">{formatMinsToHours(allTimeWatchMins)}</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-black rounded-full h-3 overflow-hidden border border-white/10 mt-1">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#FF9933] to-[#FF6600]"
                      style={{ width: `${Math.max(Math.min((allTimeWatchMins / (300 * 60)) * 100, 100), 2)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-right font-bold text-gray-500">{((allTimeWatchMins / (300 * 60)) * 100).toFixed(1)}% Completed</p>
                </div>

              </div>
            </div>

            {/* 🕉️ PERSONALIZATION SECTION */}
            <div className="border-t border-white/10 pt-6 space-y-5">
              <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                <span>🕉️ Your Dharma Journey</span>
              </h3>

              {/* Dharma Path Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">🔱 Motivation</label>
                <select
                  value={dharmaPath}
                  onChange={(e) => setDharmaPath(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300 font-bold text-gray-300"
                >
                  <option value="">Choose Path...</option>
                  <option value="🔱 I want to know my roots">🔱 I want to know my roots</option>
                  <option value="📖 I want to learn the scriptures">📖 I want to learn the scriptures</option>
                  <option value="🎵 I seek peace through devotion">🎵 I seek peace through devotion</option>
                  <option value="👨‍👩‍👧 I want my family to know our culture">👨‍👩‍👧 I want my family to know our culture</option>
                  <option value="✨ I am already on the path, want more">✨ I am already on the path, want more</option>
                </select>
              </div>

              {/* Sacred connection hours */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">🌅 Sacred Connection Time</label>
                <select
                  value={sacredTime}
                  onChange={(e) => setSacredTime(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300 font-bold text-gray-300"
                >
                  <option value="">Choose Hour...</option>
                  <option value="🌅 Early morning (Brahma Muhurta)">🌅 Early morning (Brahma Muhurta)</option>
                  <option value="☀️ During the day">☀️ During the day</option>
                  <option value="🌆 Evening prayers time">🌆 Evening prayers time</option>
                  <option value="🌙 Late night silence">🌙 Late night silence</option>
                </select>
              </div>

              {/* About Us Link */}
              <div className="space-y-1 relative z-50">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">ℹ️ About the Platform</label>
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none hover:border-[#FF9933]/60 transition duration-300 font-bold text-gray-300 flex justify-between items-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex justify-between w-full pr-4 items-center">
                    <span className="text-gray-300">About Omisha and the Inner Path</span>
                    <InfoCircleOutlined className="text-[#FF9933] text-base" />
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>

              {/* Stories Calling to Soul (Pill-badge checkboxes) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">📖 Stories Calling to your Soul</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Ramayan",
                    "Mahabharat",
                    "Bhagwat Geeta",
                    "Shiv Puran",
                    "Hanuman Katha",
                    "Devotional Music"
                  ].map((pref) => {
                    const isSelected = contentPreference.includes(pref)
                    return (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => handleContentPreferenceToggle(pref)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition duration-300 flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#FF9933]/15 border-[#FF9933] text-[#FF9933]"
                            : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-300"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${
                          isSelected ? "bg-[#FF9933] border-[#FF9933] text-black" : "border-white/20"
                        }`}>
                          {isSelected && "✓"}
                        </span>
                        <span>{pref}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold text-sm py-4 rounded-xl transition duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 shadow-[0_0_25px_rgba(255,153,51,0.2)]"
            >
              {saveStatus === 'saving' && (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              {saveStatus === 'saved' ? 'Saved Successfully ✓' : saveStatus === 'error' ? 'Error Saving Profile' : 'Save Profile'}
            </button>

          </form>
          {/* Share & QR Options */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10 relative z-50">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Omisha and the Inner Path',
                    text: 'Discover the divine journey on Omisha and the Inner Path!',
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
                  Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => {
                signOut()
                navigate('/login')
              }}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-extrabold text-sm py-4 rounded-xl border border-red-500/20 transition duration-300 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

        </div>
      </div>

      {/* QR Code Modal */}
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

      {/* Floating Bottom Navbar */}
      <BottomNavbar />


    </div>
  )
}

export default Account
