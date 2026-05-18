import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState('videos') // 'videos', 'music', 'shorts', 'users'

  // Data States
  const [videos, setVideos] = useState([])
  const [music, setMusic] = useState([])
  const [shorts, setShorts] = useState([])
  const [editingId, setEditingId] = useState(null)

  // Form States
  const [videoForm, setVideoForm] = useState({ seriesTitle: '', episodeTitle: '', youtubeId: '', thumbnailUrl: '' })
  const [musicForm, setMusicForm] = useState({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '' })
  const [shortForm, setShortForm] = useState({ description: '', youtubeId: '' })

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      setAuthed(true)
      // Load data
      setVideos(JSON.parse(localStorage.getItem('admin_videos') || '[]'))
      setMusic(JSON.parse(localStorage.getItem('admin_music') || '[]'))
      setShorts(JSON.parse(localStorage.getItem('admin_shorts') || '[]'))
    } else {
      alert('Access Denied: You are not authorized to view the Admin Dashboard.')
      navigate('/home')
    }
  }, [navigate])

  const saveToLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Generic Submit Handler
  const handleVideoSubmit = (e) => {
    e.preventDefault()
    let newData
    if (editingId) {
      newData = videos.map(v => v.id === editingId ? { ...videoForm, id: editingId } : v)
    } else {
      newData = [{ ...videoForm, id: Date.now().toString() }, ...videos]
    }
    setVideos(newData)
    saveToLocal('admin_videos', newData)
    setVideoForm({ seriesTitle: '', episodeTitle: '', youtubeId: '', thumbnailUrl: '' })
    setEditingId(null)
  }

  const handleMusicSubmit = (e) => {
    e.preventDefault()
    let newData
    if (editingId) {
      newData = music.map(m => m.id === editingId ? { ...musicForm, id: editingId } : m)
    } else {
      newData = [{ ...musicForm, id: Date.now().toString() }, ...music]
    }
    setMusic(newData)
    saveToLocal('admin_music', newData)
    setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '' })
    setEditingId(null)
  }

  const handleShortSubmit = (e) => {
    e.preventDefault()
    let newData
    if (editingId) {
      newData = shorts.map(s => s.id === editingId ? { ...shortForm, id: editingId } : s)
    } else {
      newData = [{ ...shortForm, id: Date.now().toString() }, ...shorts]
    }
    setShorts(newData)
    saveToLocal('admin_shorts', newData)
    setShortForm({ description: '', youtubeId: '' })
    setEditingId(null)
  }

  // Delete Handlers
  const deleteVideo = (id) => {
    const newData = videos.filter(v => v.id !== id)
    setVideos(newData)
    saveToLocal('admin_videos', newData)
  }
  const deleteMusic = (id) => {
    const newData = music.filter(m => m.id !== id)
    setMusic(newData)
    saveToLocal('admin_music', newData)
  }
  const deleteShort = (id) => {
    const newData = shorts.filter(s => s.id !== id)
    setShorts(newData)
    saveToLocal('admin_shorts', newData)
  }

  // Edit Handlers
  const editVideo = (item) => { setVideoForm(item); setEditingId(item.id); window.scrollTo(0,0) }
  const editMusic = (item) => { setMusicForm(item); setEditingId(item.id); window.scrollTo(0,0) }
  const editShort = (item) => { setShortForm(item); setEditingId(item.id); window.scrollTo(0,0) }

  // Cancel Edit
  const cancelEdit = () => {
    setEditingId(null)
    setVideoForm({ seriesTitle: '', episodeTitle: '', youtubeId: '', thumbnailUrl: '' })
    setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '' })
    setShortForm({ description: '', youtubeId: '' })
  }

  if (!authed) return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const TABS = [
    { id: 'videos', label: 'Videos', icon: '📺' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'shorts', label: 'Shorts', icon: '📱' },
    { id: 'users', label: 'Users', icon: '👥' },
  ]

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-24 selection:bg-[#FF9933]/30">
      
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="Logo" className="w-8 h-8 rounded-full border border-[#FF9933]/50" />
          <h1 className="font-black text-sm tracking-tight">Admin <span className="text-[#FF9933]">Dashboard</span></h1>
        </div>
        <button onClick={() => navigate('/home')} className="text-xs font-bold text-gray-400 hover:text-white transition">Exit Admin</button>
      </div>

      {/* Main Content Area */}
      <div className="p-5 max-w-4xl mx-auto space-y-8">
        
        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="animate-fade-in space-y-8">
            <form onSubmit={handleVideoSubmit} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h2 className="text-xl font-black text-[#FF9933]">{editingId ? 'Edit Video' : 'Add New Video'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="Series Title" value={videoForm.seriesTitle} onChange={e=>setVideoForm({...videoForm, seriesTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="Episode Title" value={videoForm.episodeTitle} onChange={e=>setVideoForm({...videoForm, episodeTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="YouTube ID" value={videoForm.youtubeId} onChange={e=>setVideoForm({...videoForm, youtubeId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="url" placeholder="Thumbnail URL" value={videoForm.thumbnailUrl} onChange={e=>setVideoForm({...videoForm, thumbnailUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition">{editingId ? 'Save Changes' : 'Upload Video'}</button>
                {editingId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">Uploaded Videos</h3>
              {videos.length === 0 && <p className="text-sm text-gray-500">No videos uploaded yet.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map(v => (
                  <div key={v.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-4 items-center">
                    <img src={v.thumbnailUrl} alt="thumb" className="w-20 h-14 object-cover rounded-md bg-black" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{v.episodeTitle}</p>
                      <p className="text-xs text-gray-400 truncate">{v.seriesTitle}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={()=>editVideo(v)} className="text-xs text-[#FF9933] font-bold">Edit</button>
                      <button onClick={()=>deleteVideo(v.id)} className="text-xs text-red-500 font-bold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MUSIC TAB */}
        {activeTab === 'music' && (
          <div className="animate-fade-in space-y-8">
            <form onSubmit={handleMusicSubmit} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h2 className="text-xl font-black text-[#FF9933]">{editingId ? 'Edit Music' : 'Add New Music'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="Track Title" value={musicForm.trackTitle} onChange={e=>setMusicForm({...musicForm, trackTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="Artist" value={musicForm.artist} onChange={e=>setMusicForm({...musicForm, artist: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="YouTube ID" value={musicForm.youtubeId} onChange={e=>setMusicForm({...musicForm, youtubeId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="url" placeholder="Cover Art URL" value={musicForm.coverUrl} onChange={e=>setMusicForm({...musicForm, coverUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition">{editingId ? 'Save Changes' : 'Upload Music'}</button>
                {editingId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">Uploaded Music</h3>
              {music.length === 0 && <p className="text-sm text-gray-500">No music uploaded yet.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {music.map(m => (
                  <div key={m.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-4 items-center">
                    <img src={m.coverUrl} alt="thumb" className="w-14 h-14 object-cover rounded-md bg-black" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{m.trackTitle}</p>
                      <p className="text-xs text-gray-400 truncate">{m.artist}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={()=>editMusic(m)} className="text-xs text-[#FF9933] font-bold">Edit</button>
                      <button onClick={()=>deleteMusic(m.id)} className="text-xs text-red-500 font-bold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHORTS TAB */}
        {activeTab === 'shorts' && (
          <div className="animate-fade-in space-y-8">
            <form onSubmit={handleShortSubmit} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h2 className="text-xl font-black text-[#FF9933]">{editingId ? 'Edit Short' : 'Add New Short'}</h2>
              <textarea required rows="2" placeholder="Short Description" value={shortForm.description} onChange={e=>setShortForm({...shortForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none resize-none" />
              <input required type="text" placeholder="YouTube Short ID" value={shortForm.youtubeId} onChange={e=>setShortForm({...shortForm, youtubeId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition">{editingId ? 'Save Changes' : 'Upload Short'}</button>
                {editingId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">Uploaded Shorts</h3>
              {shorts.length === 0 && <p className="text-sm text-gray-500">No shorts uploaded yet.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shorts.map(s => (
                  <div key={s.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-4 items-center">
                    <div className="w-10 h-14 bg-black rounded-md flex items-center justify-center border border-white/10 shrink-0">
                      <span className="text-lg">📱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{s.description}</p>
                      <p className="text-xs text-gray-400 truncate">ID: {s.youtubeId}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={()=>editShort(s)} className="text-xs text-[#FF9933] font-bold">Edit</button>
                      <button onClick={()=>deleteShort(s.id)} className="text-xs text-red-500 font-bold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-black text-white">Devotee Directory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.1)]">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Devotees</p>
                <p className="text-3xl font-black text-white">1,208</p>
              </div>
              <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.1)]">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active This Week</p>
                <p className="text-3xl font-black text-[#FF9933]">842</p>
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white">Recent Registrations</h3>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { name: "Vinith Shetty", email: "vinuvinith0007@gmail.com", date: "Today", role: "Admin", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vinith" },
                  { name: "Arjun Kumar", email: "arjun.k@example.com", date: "Yesterday", role: "User", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" },
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
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${user.role === 'Admin' ? 'bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30' : 'bg-white/10 text-gray-400'}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ADMIN BOTTOM NAVBAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
        <div className="max-w-md mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); cancelEdit(); }}
                className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-br from-[#FF9933] to-[#FF6600] text-black shadow-[0_0_15px_rgba(255,153,51,0.3)] scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xl mb-0.5">{tab.icon}</span>
                <span className={`text-[9px] font-extrabold ${isActive ? 'text-black' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default Admin