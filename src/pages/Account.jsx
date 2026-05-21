import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNavbar from '../components/BottomNavbar'
import Navbar from '../components/Navbar'
import { useTranslation } from 'react-i18next'

function Account() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
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
  const [language, setLanguage] = useState(i18n.language)
  
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle', 'saving', 'saved', 'error'

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
            if (data.language) {
              setLanguage(data.language)
              i18n.changeLanguage(data.language)
            }
          }
        } catch (err) {
          console.error("Error retrieving Supabase devotee profile:", err)
        }
      }
      fetchProfile()
    }
  }, [profileEmail, i18n])

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
            sacred_time: sacredTime || null,
            language: language || null
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

  // Sign out / Reset subscription
  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('subscribed')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('profileEmail')
      localStorage.removeItem('profileName')
      localStorage.removeItem('profileContact')
      localStorage.removeItem('profileAvatar')
      window.location.href = '/login'
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
              {t('account.title')}
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
                <label className="text-xs font-bold text-[#FF9933] uppercase tracking-wider block">{t('account.display_name')}</label>
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
                <label className="text-xs font-bold text-[#FF9933] uppercase tracking-wider block">{t('account.contact_number')}</label>
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

            {/* 🕉️ PERSONALIZATION SECTION */}
            <div className="border-t border-white/10 pt-6 space-y-5">
              <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                <span>🕉️ {t('account.dharma_journey')}</span>
              </h3>

              {/* Dharma Path Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">🔱 {t('account.motivation')}</label>
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">🌅 {t('account.sacred_time')}</label>
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

              {/* Language Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">🇮🇳 {t('account.comfort_language')}</label>
                <select
                  value={(i18n.language || 'en').substring(0, 2)}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setLanguage(newLang);
                    i18n.changeLanguage(newLang);
                  }}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9933]/60 transition duration-300 font-bold text-gray-300"
                >
                  <option value="en"> English</option>
                  <option value="hi"> Hindi / हिंदी</option>
                  <option value="kn"> Kannada / ಕನ್ನಡ</option>
                  <option value="te"> Telugu / తెలుగు</option>
                  <option value="ta"> Tamil / தமிழ்</option>
                </select>
              </div>

              {/* Stories Calling to Soul (Pill-badge checkboxes) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">📖 {t('account.stories')}</label>
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
              {saveStatus === 'saved' ? t('account.saved') : saveStatus === 'error' ? t('account.error') : t('account.save')}
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
              {t('account.sign_out')}
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
                  {t('nav.admin')}
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
