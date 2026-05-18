import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState('videos') // 'videos', 'music', 'shorts', 'users'

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      setAuthed(true)
    } else {
      alert('Access Denied: You are not authorized to view the Admin Dashboard.')
      navigate('/home')
    }
  }, [navigate])

  const handleAction = (e) => {
    e.preventDefault()
    alert('Content saved successfully! (Data will be wired to backend soon)')
    e.target.reset()
  }

  if (!authed) return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-semibold">Authorizing Session...</p>
      </div>
    </div>
  )

  const TABS = [
    { id: 'videos', label: 'Series & Episodes', icon: '📺' },
    { id: 'music', label: 'Devotional Music', icon: '🎵' },
    { id: 'shorts', label: 'Divine Shorts', icon: '📱' },
    { id: 'users', label: 'Devotee Users', icon: '👥' },
  ]

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white flex flex-col md:flex-row selection:bg-[#FF9933]/30">
      
      {/* Sidebar / Top Navigation */}
      <div className="w-full md:w-64 bg-black/60 border-b md:border-b-0 md:border-r border-white/10 p-5 shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/home')}>
          <img src="/icon-192.png" alt="Logo" className="w-10 h-10 rounded-full border border-[#FF9933]/50" />
          <div>
            <h1 className="font-black text-sm tracking-tight leading-tight">Sanatan Dharma<br/><span className="text-[#FF9933]">Admin Panel</span></h1>
          </div>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black shadow-[0_0_15px_rgba(255,153,51,0.3)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden md:block">
          <button 
            onClick={() => navigate('/home')}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-sm border border-white/5 transition"
          >
            ← Back to App
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 md:p-8 overflow-y-auto h-auto md:h-screen">
        
        {/* VIDEOS & SERIES TAB */}
        {activeTab === 'videos' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Upload Video / Episode</h2>
              <p className="text-gray-400 text-sm">Add a new episode to an existing series or start a new one.</p>
            </div>
            
            <form onSubmit={handleAction} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Series Title</label>
                <input required type="text" placeholder="e.g. Mahabharata, Ramayana" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 focus:ring-1 focus:ring-[#FF9933]/50 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Episode Title</label>
                <input required type="text" placeholder="e.g. Episode 1: The Beginning" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">YouTube Video ID</label>
                <input required type="text" placeholder="e.g. dQw4w9WgXcQ" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
                <p className="text-[10px] text-gray-500 mt-1">The 11-character code from the YouTube URL.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thumbnail Image URL</label>
                <input required type="url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
              </div>
              <button type="submit" className="w-full bg-[#FF9933] hover:bg-[#FF6600] text-black font-extrabold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(255,153,51,0.2)]">
                Publish Episode
              </button>
            </form>
          </div>
        )}

        {/* MUSIC TAB */}
        {activeTab === 'music' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Upload Devotional Music</h2>
              <p className="text-gray-400 text-sm">Embed YouTube audio tracks for the music player.</p>
            </div>
            
            <form onSubmit={handleAction} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Track Title</label>
                <input required type="text" placeholder="e.g. Shri Krishna Govind Hare Murari" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Artist / Singer</label>
                <input required type="text" placeholder="e.g. Jagjit Singh" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">YouTube Audio ID</label>
                <input required type="text" placeholder="11-character YouTube ID" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Art Image URL</label>
                <input required type="url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
              </div>
              <button type="submit" className="w-full bg-[#FF9933] hover:bg-[#FF6600] text-black font-extrabold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(255,153,51,0.2)]">
                Add to Playlist
              </button>
            </form>
          </div>
        )}

        {/* SHORTS TAB */}
        {activeTab === 'shorts' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Upload Divine Short</h2>
              <p className="text-gray-400 text-sm">Add vertical videos for the TikTok-style scrolling feed.</p>
            </div>
            
            <form onSubmit={handleAction} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Short Description / Title</label>
                <textarea required rows="2" placeholder="e.g. Beautiful Gita Shloka Chanting..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">YouTube Short ID</label>
                <input required type="text" placeholder="11-character YouTube ID" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9933]/50 transition" />
                <p className="text-[10px] text-gray-500 mt-1">Found in the URL: youtube.com/shorts/<strong>ID_HERE</strong></p>
              </div>
              <button type="submit" className="w-full bg-[#FF9933] hover:bg-[#FF6600] text-black font-extrabold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(255,153,51,0.2)]">
                Publish Short
              </button>
            </form>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Devotee Directory</h2>
              <p className="text-gray-400 text-sm">Manage users who have subscribed via Google.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.1)]">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Devotees</p>
                <p className="text-3xl font-black text-white">1,208</p>
              </div>
              <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.1)]">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active This Week</p>
                <p className="text-3xl font-black text-[#FF9933]">842</p>
              </div>
              <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.1)]">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Premium Admins</p>
                <p className="text-3xl font-black text-white">1</p>
              </div>
            </div>

            {/* Mock User List */}
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white">Recent Registrations</h3>
              </div>
              <div className="divide-y divide-white/5">
                {/* Mock Users */}
                {[
                  { name: "Vinith Shetty", email: "vinuvinith0007@gmail.com", date: "Today", role: "Admin", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vinith" },
                  { name: "Arjun Kumar", email: "arjun.k@example.com", date: "Yesterday", role: "User", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" },
                  { name: "Priya Sharma", email: "priya.sharma@example.com", date: "2 days ago", role: "User", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
                  { name: "Rahul Singh", email: "rahulsingh@example.com", date: "3 days ago", role: "User", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
                ].map((user, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition">
                    <div className="flex items-center gap-4">
                      <img src={user.img} alt={user.name} className="w-10 h-10 rounded-full bg-white/10" />
                      <div>
                        <p className="font-bold text-sm text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${user.role === 'Admin' ? 'bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30' : 'bg-white/10 text-gray-400'}`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">Joined {user.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default Admin