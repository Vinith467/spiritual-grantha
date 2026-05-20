import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  HomeOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined,
  MobileOutlined,
  UserOutlined,
  PictureOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'

function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState('videos')

  // Loading States
  const [loading, setLoading] = useState(false)

  // Data States
  const [banners, setBanners] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [episodesList, setEpisodesList] = useState([])
  const [music, setMusic] = useState([])
  const [shorts, setShorts] = useState([])
  const [profiles, setProfiles] = useState([])

  // Active editing item ID
  const [editingId, setEditingId] = useState(null)
  const [editingSeriesId, setEditingSeriesId] = useState(null)
  const [editingEpisodeId, setEditingEpisodeId] = useState(null)

  // Video Sub-Tab state: 'episodes' or 'series'
  const [videoSubTab, setVideoSubTab] = useState('episodes')

  // Form States
  const [bannerForm, setBannerForm] = useState({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '' })
  const [seriesForm, setSeriesForm] = useState({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '' })
  const [episodeForm, setEpisodeForm] = useState({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '' })
  const [musicForm, setMusicForm] = useState({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional' })
  const [shortForm, setShortForm] = useState({ title: 'Divine Short', description: '', youtubeId: '' })

  // Data Loaders
  const loadBanners = useCallback(async () => {
    const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false })
    if (!error && data) setBanners(data)
  }, [])

  const loadSeriesAndEpisodes = useCallback(async () => {
    const { data: sData, error: sErr } = await supabase.from('series').select('*').order('created_at', { ascending: false })
    if (!sErr && sData) setSeriesList(sData)

    const { data: epData, error: epErr } = await supabase.from('episodes').select('*').order('created_at', { ascending: false })
    if (!epErr && epData) setEpisodesList(epData)
  }, [])

  const loadMusic = useCallback(async () => {
    const { data, error } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false })
    if (!error && data) setMusic(data)
  }, [])

  const loadShorts = useCallback(async () => {
    const { data, error } = await supabase.from('shorts').select('*').order('created_at', { ascending: false })
    if (!error && data) setShorts(data)
  }, [])

  const loadProfiles = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!error && data) setProfiles(data)
  }, [])

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      setAuthed(true)
      setLoading(true)
      Promise.all([
        loadBanners(),
        loadSeriesAndEpisodes(),
        loadMusic(),
        loadShorts(),
        loadProfiles()
      ]).finally(() => setLoading(false))
    } else {
      alert('Access Denied: You are not authorized to view the Admin Dashboard.')
      navigate('/home')
    }
  }, [navigate, loadBanners, loadSeriesAndEpisodes, loadMusic, loadShorts, loadProfiles])

  // ============================================================
  // BANNERS CRUD
  // ============================================================
  const handleBannerSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      title: bannerForm.title,
      description: bannerForm.description,
      target_id: bannerForm.targetId,
      mobile_url: bannerForm.mobileUrl,
      desktop_url: bannerForm.desktopUrl
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('banners').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('banners').insert([payload])
        if (error) throw error
      }
      setBannerForm({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '' })
      setEditingId(null)
      await loadBanners()
    } catch (err) {
      alert('Error saving banner: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const editBanner = (item) => {
    setBannerForm({
      title: item.title || '',
      description: item.description || '',
      targetId: item.target_id || '',
      mobileUrl: item.mobile_url || '',
      desktopUrl: item.desktop_url || ''
    })
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
      await loadBanners()
    } catch (err) {
      alert('Error deleting banner: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // SERIES CRUD
  // ============================================================
  const handleSeriesSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      title: seriesForm.title,
      description: seriesForm.description,
      thumbnail_url: seriesForm.thumbnail_url,
      desktop_thumbnail_url: seriesForm.desktop_thumbnail_url
    }

    try {
      if (editingSeriesId) {
        const { error } = await supabase.from('series').update(payload).eq('id', editingSeriesId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('series').insert([payload])
        if (error) throw error
      }
      setSeriesForm({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '' })
      setEditingSeriesId(null)
      await loadSeriesAndEpisodes()
    } catch (err) {
      alert('Error saving series: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const editSeries = (item) => {
    setSeriesForm({
      title: item.title || '',
      description: item.description || '',
      thumbnail_url: item.thumbnail_url || '',
      desktop_thumbnail_url: item.desktop_thumbnail_url || ''
    })
    setEditingSeriesId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteSeries = async (id) => {
    if (!confirm('Warning: Deleting a series will also orphan or break related episodes. Are you sure you want to delete this series?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('series').delete().eq('id', id)
      if (error) throw error
      await loadSeriesAndEpisodes()
    } catch (err) {
      alert('Error deleting series: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // EPISODES CRUD
  // ============================================================
  const handleEpisodeSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      series_id: episodeForm.series_id,
      title: episodeForm.title,
      youtube_id: episodeForm.youtube_id,
      thumbnail_url: episodeForm.thumbnail_url || `https://img.youtube.com/vi/${episodeForm.youtube_id}/hqdefault.jpg`,
      episode_number: parseInt(episodeForm.episode_number) || 1,
      description: episodeForm.description
    }

    try {
      if (editingEpisodeId) {
        const { error } = await supabase.from('episodes').update(payload).eq('id', editingEpisodeId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('episodes').insert([payload])
        if (error) throw error
      }
      setEpisodeForm({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '' })
      setEditingEpisodeId(null)
      await loadSeriesAndEpisodes()
    } catch (err) {
      alert('Error saving episode: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const editEpisode = (item) => {
    setEpisodeForm({
      series_id: item.series_id || '',
      title: item.title || '',
      youtube_id: item.youtube_id || '',
      thumbnail_url: item.thumbnail_url || '',
      episode_number: item.episode_number || '',
      description: item.description || ''
    })
    setEditingEpisodeId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteEpisode = async (id) => {
    if (!confirm('Are you sure you want to delete this episode?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('episodes').delete().eq('id', id)
      if (error) throw error
      await loadSeriesAndEpisodes()
    } catch (err) {
      alert('Error deleting episode: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // MUSIC CRUD
  // ============================================================
  const handleMusicSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      track_title: musicForm.trackTitle,
      artist: musicForm.artist,
      youtube_id: musicForm.youtubeId,
      cover_url: musicForm.coverUrl || `https://img.youtube.com/vi/${musicForm.youtubeId}/hqdefault.jpg`,
      category: musicForm.category
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('music_tracks').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('music_tracks').insert([payload])
        if (error) throw error
      }
      setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional' })
      setEditingId(null)
      await loadMusic()
    } catch (err) {
      alert('Error saving music: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const editMusic = (item) => {
    setMusicForm({
      trackTitle: item.track_title || '',
      artist: item.artist || '',
      youtubeId: item.youtube_id || '',
      coverUrl: item.cover_url || '',
      category: item.category || 'Devotional'
    })
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteMusic = async (id) => {
    if (!confirm('Are you sure you want to delete this music track?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('music_tracks').delete().eq('id', id)
      if (error) throw error
      await loadMusic()
    } catch (err) {
      alert('Error deleting music track: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // SHORTS CRUD
  // ============================================================
  const handleShortSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      title: shortForm.title,
      description: shortForm.description,
      youtube_id: shortForm.youtubeId
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('shorts').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('shorts').insert([payload])
        if (error) throw error
      }
      setShortForm({ title: 'Divine Short', description: '', youtubeId: '' })
      setEditingId(null)
      await loadShorts()
    } catch (err) {
      alert('Error saving short: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const editShort = (item) => {
    setShortForm({
      title: item.title || 'Divine Short',
      description: item.description || '',
      youtubeId: item.youtube_id || ''
    })
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteShort = async (id) => {
    if (!confirm('Are you sure you want to delete this short?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('shorts').delete().eq('id', id)
      if (error) throw error
      await loadShorts()
    } catch (err) {
      alert('Error deleting short: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingSeriesId(null)
    setEditingEpisodeId(null)
    setBannerForm({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '' })
    setSeriesForm({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '' })
    setEpisodeForm({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '' })
    setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional' })
    setShortForm({ title: 'Divine Short', description: '', youtubeId: '' })
  }

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    // Set immediate loading text in the target input field
    const tempText = `Uploading: ${file.name}...`
    if (field === 'thumbnail_url') {
      setSeriesForm(prev => ({ ...prev, thumbnail_url: tempText }))
    } else if (field === 'desktop_thumbnail_url') {
      setSeriesForm(prev => ({ ...prev, desktop_thumbnail_url: tempText }))
    } else if (field === 'episode_thumbnail_url') {
      setEpisodeForm(prev => ({ ...prev, thumbnail_url: tempText }))
    } else if (field === 'music_cover_url') {
      setMusicForm(prev => ({ ...prev, coverUrl: tempText }))
    }

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      // Upload to "images" bucket
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          throw new Error('Please make sure you have a public storage bucket named "images" in your Supabase storage!')
        }
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (field === 'thumbnail_url') {
        setSeriesForm(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }))
      } else if (field === 'desktop_thumbnail_url') {
        setSeriesForm(prev => ({ ...prev, desktop_thumbnail_url: urlData.publicUrl }))
      } else if (field === 'episode_thumbnail_url') {
        setEpisodeForm(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }))
      } else if (field === 'music_cover_url') {
        setMusicForm(prev => ({ ...prev, coverUrl: urlData.publicUrl }))
      }
    } catch (err) {
      // Revert loading text to empty string on failure
      if (field === 'thumbnail_url') {
        setSeriesForm(prev => ({ ...prev, thumbnail_url: '' }))
      } else if (field === 'desktop_thumbnail_url') {
        setSeriesForm(prev => ({ ...prev, desktop_thumbnail_url: '' }))
      } else if (field === 'episode_thumbnail_url') {
        setEpisodeForm(prev => ({ ...prev, thumbnail_url: '' }))
      } else if (field === 'music_cover_url') {
        setMusicForm(prev => ({ ...prev, coverUrl: '' }))
      }
      alert('Upload failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getActiveThisWeekCount = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return profiles.filter(p => p.last_login && new Date(p.last_login) >= sevenDaysAgo).length
  }

  const getDharmaPathStats = () => {
    const stats = {}
    let total = 0
    profiles.forEach(p => {
      if (p.dharma_path) {
        stats[p.dharma_path] = (stats[p.dharma_path] || 0) + 1
        total++
      }
    })
    return { stats, total }
  }

  const getContentPreferenceStats = () => {
    const stats = {}
    let total = 0
    profiles.forEach(p => {
      if (Array.isArray(p.content_preference)) {
        p.content_preference.forEach(pref => {
          stats[pref] = (stats[pref] || 0) + 1
          total++
        })
      }
    })
    return { stats, total }
  }

  const getSacredTimeStats = () => {
    const stats = {}
    let total = 0
    profiles.forEach(p => {
      if (p.sacred_time) {
        stats[p.sacred_time] = (stats[p.sacred_time] || 0) + 1
        total++
      }
    })
    return { stats, total }
  }

  const getLanguageStats = () => {
    const stats = {}
    let total = 0
    profiles.forEach(p => {
      if (p.language) {
        stats[p.language] = (stats[p.language] || 0) + 1
        total++
      }
    })
    return { stats, total }
  }

  if (!authed) return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const TABS = [
    { id: 'videos', label: 'Videos', icon: <VideoCameraOutlined /> },
    { id: 'music', label: 'Music', icon: <CustomerServiceOutlined /> },
    { id: 'shorts', label: 'Shorts', icon: <MobileOutlined /> },
    { id: 'users', label: 'Users', icon: <UserOutlined /> },
  ]

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-28 selection:bg-[#FF9933]/30">

      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="Logo" className="w-8 h-8 rounded-full border border-[#FF9933]/50" />
          <h1 className="font-black text-sm tracking-tight flex items-center gap-2">
            Admin <span className="text-[#FF9933]">Dashboard</span>
            {loading && <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933] animate-ping" />}
          </h1>
        </div>
        <button onClick={() => navigate('/home')} className="text-xs font-bold text-gray-400 hover:text-white transition">Exit Admin</button>
      </div>

      {/* Main Content Area */}
      <div className="p-5 max-w-4xl mx-auto space-y-8">

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="animate-fade-in space-y-8">
            {/* Sub-tab selection */}
            <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10 max-w-sm">
              <button
                onClick={() => { setVideoSubTab('episodes'); cancelEdit(); }}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${videoSubTab === 'episodes' ? 'bg-[#FF9933] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                <PlayCircleOutlined /> Manage Episodes ({episodesList.length})
              </button>
              <button
                onClick={() => { setVideoSubTab('series'); cancelEdit(); }}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${videoSubTab === 'series' ? 'bg-[#FF9933] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                <FolderOpenOutlined /> Manage Series ({seriesList.length})
              </button>
            </div>

            {/* EPISODES MANAGEMENT */}
            {videoSubTab === 'episodes' && (
              <div className="space-y-8">
                <form onSubmit={handleEpisodeSubmit} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
                  <h2 className="text-xl font-black text-[#FF9933]">{editingEpisodeId ? 'Edit Episode (Supabase)' : 'Add New Episode (Supabase)'}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">Select Series Category</label>
                      <select
                        required
                        value={episodeForm.series_id}
                        onChange={e => setEpisodeForm({ ...episodeForm, series_id: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none text-white [&>option]:bg-[#141414] [&>option]:text-white"
                      >
                        <option value="">-- Choose Series --</option>
                        {seriesList.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                    <input required type="text" placeholder="Episode Title" value={episodeForm.title} onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                    <input required type="number" placeholder="Episode Number" value={episodeForm.episode_number} onChange={e => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                    <input required type="text" placeholder="YouTube Video ID" value={episodeForm.youtube_id} onChange={e => setEpisodeForm({ ...episodeForm, youtube_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Custom Thumbnail (Optional)</label>
                      <div className="flex gap-2">
                        <input type="url" placeholder="Optional URL (or auto-gen)" value={episodeForm.thumbnail_url} onChange={e => setEpisodeForm({ ...episodeForm, thumbnail_url: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 flex items-center justify-center text-xs font-bold transition whitespace-nowrap">
                          <span>Upload</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'episode_thumbnail_url')} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <textarea placeholder="Episode Description (Optional)" rows="2" value={episodeForm.description} onChange={e => setEpisodeForm({ ...episodeForm, description: e.target.value })} className="w-full sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition disabled:opacity-50">{editingEpisodeId ? 'Save Episode' : 'Upload Episode'}</button>
                    {editingEpisodeId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
                  </div>
                </form>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex justify-between items-center">
                    <span>Uploaded Episodes ({episodesList.length})</span>
                    <span className="text-xs text-gray-500 font-normal">Supabase DB</span>
                  </h3>
                  {episodesList.length === 0 && <p className="text-sm text-gray-500">No episodes found. Select "Manage Series" to create a series first, then upload episodes here.</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {episodesList.map(v => {
                      const parentSeries = seriesList.find(s => s.id === v.series_id)
                      return (
                        <div key={v.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-4 items-center relative overflow-hidden group hover:border-[#FF9933]/30 transition-all">
                          <img src={v.thumbnail_url} alt="thumb" className="w-20 h-14 object-cover rounded-md bg-black shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{v.title}</p>
                            <p className="text-xs text-gray-400 truncate">{parentSeries ? parentSeries.title : 'No Series'} • EP {v.episode_number}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button onClick={() => editEpisode(v)} className="text-xs text-[#FF9933] font-bold flex items-center gap-1 hover:underline"><EditOutlined /> Edit</button>
                            <button onClick={() => deleteEpisode(v.id)} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"><DeleteOutlined /> Delete</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SERIES MANAGEMENT */}
            {videoSubTab === 'series' && (
              <div className="space-y-8">
                <form onSubmit={handleSeriesSubmit} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
                  <h2 className="text-xl font-black text-[#FF9933]">{editingSeriesId ? 'Edit Series Category (Supabase)' : 'Create New Series Category (Supabase)'}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required type="text" placeholder="Series/Show Title" value={seriesForm.title} onChange={e => setSeriesForm({ ...seriesForm, title: e.target.value })} className="w-full sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Mobile Thumbnail (Vertical)</label>
                      <div className="flex gap-2">
                        <input type="url" placeholder="Mobile Thumbnail Image URL" value={seriesForm.thumbnail_url} onChange={e => setSeriesForm({ ...seriesForm, thumbnail_url: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 flex items-center justify-center text-xs font-bold transition whitespace-nowrap">
                          <span>Upload</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail_url')} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Desktop Banner (Horizontal)</label>
                      <div className="flex gap-2">
                        <input type="url" placeholder="Desktop Banner Image URL" value={seriesForm.desktop_thumbnail_url} onChange={e => setSeriesForm({ ...seriesForm, desktop_thumbnail_url: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 flex items-center justify-center text-xs font-bold transition whitespace-nowrap">
                          <span>Upload</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'desktop_thumbnail_url')} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <textarea placeholder="Description / Summary (Used in Hero Carousel banner if selected)" rows="2" value={seriesForm.description} onChange={e => setSeriesForm({ ...seriesForm, description: e.target.value })} className="w-full sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition disabled:opacity-50">{editingSeriesId ? 'Save Series' : 'Create Series'}</button>
                    {editingSeriesId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
                  </div>
                </form>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex justify-between items-center">
                    <span>Active Series Categories ({seriesList.length})</span>
                    <span className="text-xs text-gray-500 font-normal">Supabase DB</span>
                  </h3>
                  {seriesList.length === 0 && <p className="text-sm text-gray-500">No series categories created yet.</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {seriesList.map(s => {
                      const count = episodesList.filter(ep => ep.series_id === s.id).length
                      return (
                        <div key={s.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-4 items-center relative overflow-hidden group hover:border-[#FF9933]/30 transition-all">
                          <img src={s.thumbnail_url} alt="thumb" className="w-14 h-20 object-cover rounded-md bg-black shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{s.title}</p>
                            <p className="text-xs text-gray-400 truncate">{count} Episodes</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button onClick={() => editSeries(s)} className="text-xs text-[#FF9933] font-bold flex items-center gap-1 hover:underline"><EditOutlined /> Edit</button>
                            <button onClick={() => deleteSeries(s.id)} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"><DeleteOutlined /> Delete</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MUSIC TAB */}
        {activeTab === 'music' && (
          <div className="animate-fade-in space-y-8">
            <form onSubmit={handleMusicSubmit} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h2 className="text-xl font-black text-[#FF9933]">{editingId ? 'Edit Devotional Track (Supabase)' : 'Add New Devotional Track (Supabase)'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="Track Title" value={musicForm.trackTitle} onChange={e => setMusicForm({ ...musicForm, trackTitle: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="Artist / Singer" value={musicForm.artist} onChange={e => setMusicForm({ ...musicForm, artist: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="YouTube Video ID (for audio stream)" value={musicForm.youtubeId} onChange={e => setMusicForm({ ...musicForm, youtubeId: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input type="text" placeholder="Category (e.g. Bhajan, Mantra, Aarti)" value={musicForm.category} onChange={e => setMusicForm({ ...musicForm, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-gray-400">Cover Art/Thumbnail URL (Optional)</label>
                  <div className="flex gap-2">
                    <input type="url" placeholder="Optional URL (or defaults to Youtube cover)" value={musicForm.coverUrl} onChange={e => setMusicForm({ ...musicForm, coverUrl: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 flex items-center justify-center text-xs font-bold transition whitespace-nowrap">
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'music_cover_url')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition disabled:opacity-50">{editingId ? 'Save Changes' : 'Upload Track'}</button>
                {editingId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex justify-between items-center">
                <span>Devotional Music Tracks ({music.length})</span>
                <span className="text-xs text-gray-500 font-normal">Supabase DB</span>
              </h3>
              {music.length === 0 && <p className="text-sm text-gray-500">No custom devotional tracks uploaded yet.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {music.map(m => (
                  <div key={m.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-4 items-center relative overflow-hidden group hover:border-[#FF9933]/30 transition-all">
                    <img src={m.cover_url} alt="cover" className="w-14 h-14 object-cover rounded-md bg-black shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{m.track_title}</p>
                      <p className="text-xs text-gray-400 truncate">{m.artist} • <span className="text-[#FF9933]">{m.category}</span></p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => editMusic(m)} className="text-xs text-[#FF9933] font-bold flex items-center gap-1 hover:underline"><EditOutlined /> Edit</button>
                      <button onClick={() => deleteMusic(m.id)} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"><DeleteOutlined /> Delete</button>
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
              <h2 className="text-xl font-black text-[#FF9933]">{editingId ? 'Edit Divine Short (Supabase)' : 'Add New Divine Short (Supabase)'}</h2>
              <div className="grid grid-cols-1 gap-4">
                <input required type="text" placeholder="Shorts Title" value={shortForm.title} onChange={e => setShortForm({ ...shortForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="YouTube Short ID (e.g. e9GgY2gH_nQ)" value={shortForm.youtubeId} onChange={e => setShortForm({ ...shortForm, youtubeId: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <textarea required rows="2" placeholder="Short Description / Hashtags" value={shortForm.description} onChange={e => setShortForm({ ...shortForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition disabled:opacity-50">{editingId ? 'Save Changes' : 'Upload Short'}</button>
                {editingId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex justify-between items-center">
                <span>Active Divine Shorts ({shorts.length})</span>
                <span className="text-xs text-gray-500 font-normal">Supabase DB</span>
              </h3>
              {shorts.length === 0 && <p className="text-sm text-gray-500">No shorts uploaded yet.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shorts.map(s => (
                  <div key={s.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-4 items-center relative overflow-hidden group hover:border-[#FF9933]/30 transition-all">
                    <div className="w-10 h-14 bg-black rounded-md flex items-center justify-center border border-white/10 shrink-0">
                      <span className="text-lg">📱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{s.title}</p>
                      <p className="text-xs text-gray-400 truncate">ID: {s.youtube_id}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => editShort(s)} className="text-xs text-[#FF9933] font-bold flex items-center gap-1 hover:underline"><EditOutlined /> Edit</button>
                      <button onClick={() => deleteShort(s.id)} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"><DeleteOutlined /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (() => {
          const dharmaStats = getDharmaPathStats();
          const contentStats = getContentPreferenceStats();
          const timeStats = getSacredTimeStats();
          const languageStats = getLanguageStats();

          return (
            <div className="animate-fade-in space-y-8 pb-10">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Devotee Directory & Insights 📊
              </h2>

              {/* Total Counts Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.05)]">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Registered Devotees</p>
                  <p className="text-4xl font-black text-white">{profiles.length}</p>
                </div>
                <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.05)]">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active Devotees This Week</p>
                  <p className="text-4xl font-black text-[#FF9933]">{getActiveThisWeekCount()}</p>
                </div>
              </div>

              {/* Personalization Insights Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dharma Path Motivation */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <h3 className="font-bold text-sm text-[#FF9933] tracking-wide uppercase border-b border-white/5 pb-2 flex justify-between items-center">
                    <span>🔱 Dharma Path Motivations</span>
                    <span className="text-[10px] text-gray-500 font-normal">({dharmaStats.total} responses)</span>
                  </h3>
                  <div className="space-y-4">
                    {dharmaStats.total === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-4">No data collected yet.</p>
                    ) : (
                      Object.entries(dharmaStats.stats).map(([key, value]) => {
                        const percentage = Math.round((value / dharmaStats.total) * 100);
                        return (
                          <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-gray-300">
                              <span>{key}</span>
                              <span className="text-[#FF9933]">{value} ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#FF6600] rounded-full shadow-[0_0_10px_rgba(255,153,51,0.5)]" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Content Preference Stories */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <h3 className="font-bold text-sm text-[#FF9933] tracking-wide uppercase border-b border-white/5 pb-2 flex justify-between items-center">
                    <span>📖 Stories Calling to Soul</span>
                    <span className="text-[10px] text-gray-500 font-normal">({contentStats.total} selections)</span>
                  </h3>
                  <div className="space-y-4">
                    {contentStats.total === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-4">No data collected yet.</p>
                    ) : (
                      Object.entries(contentStats.stats).map(([key, value]) => {
                        const percentage = Math.round((value / profiles.length) * 100); // Percentage out of total devotees
                        return (
                          <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-gray-300">
                              <span>{key}</span>
                              <span className="text-[#FF9933]">{value} ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#FF6600] rounded-full shadow-[0_0_10px_rgba(255,153,51,0.5)]" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Sacred Time Connections */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <h3 className="font-bold text-sm text-[#FF9933] tracking-wide uppercase border-b border-white/5 pb-2 flex justify-between items-center">
                    <span>🌅 Sacred Connection Hours</span>
                    <span className="text-[10px] text-gray-500 font-normal">({timeStats.total} responses)</span>
                  </h3>
                  <div className="space-y-4">
                    {timeStats.total === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-4">No data collected yet.</p>
                    ) : (
                      Object.entries(timeStats.stats).map(([key, value]) => {
                        const percentage = Math.round((value / timeStats.total) * 100);
                        return (
                          <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-gray-300">
                              <span>{key}</span>
                              <span className="text-[#FF9933]">{value} ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#FF6600] rounded-full shadow-[0_0_10px_rgba(255,153,51,0.5)]" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Demographics & Comfort Language */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <h3 className="font-bold text-sm text-[#FF9933] tracking-wide uppercase border-b border-white/5 pb-2 flex justify-between items-center">
                    <span>🌸 Comfort Languages</span>
                    <span className="text-[10px] text-gray-500 font-normal">({languageStats.total} responses)</span>
                  </h3>
                  <div className="space-y-4">
                    {languageStats.total === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-4">No data collected yet.</p>
                    ) : (
                      Object.entries(languageStats.stats).map(([key, value]) => {
                        const percentage = Math.round((value / languageStats.total) * 100);
                        return (
                          <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-gray-300">
                              <span>{key}</span>
                              <span className="text-[#FF9933]">{value} ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#FF6600] rounded-full shadow-[0_0_10px_rgba(255,153,51,0.5)]" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Devotee Listings Card */}
              <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                  <h3 className="font-bold text-white">Devotee Registrations ({profiles.length})</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {profiles.length === 0 ? (
                    <p className="p-6 text-sm text-gray-500 text-center">No devotees registered yet.</p>
                  ) : (
                    profiles.map((user, i) => (
                      <div key={user.id || i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition gap-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full bg-white/10 object-cover" 
                          />
                          <div>
                            <p className="font-bold text-sm text-white">
                              {user.name} 
                              {user.display_name && (
                                <span className="text-[#FF9933] text-xs font-bold bg-[#FF9933]/10 px-2 py-0.5 rounded-full ml-2">
                                  "{user.display_name}"
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>

                        {/* Personalization badges inside list */}
                        <div className="flex flex-wrap items-center gap-2">
                          {user.language && (
                            <span className="text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10 px-2 py-1 rounded-full">
                              {user.language}
                            </span>
                          )}
                          {user.sacred_time && (
                            <span className="text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10 px-2 py-1 rounded-full">
                              {user.sacred_time.split(' ')[0] /* Get emoji only */}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${user.role === 'Admin' ? 'bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30' : 'bg-white/10 text-gray-400'}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ADMIN BOTTOM NAVBAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
        <div className="max-w-md mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  cancelEdit();
                }}
                className={`flex flex-col items-center justify-center min-w-[3.5rem] sm:min-w-[4rem] h-14 rounded-2xl transition-all duration-300 flex-shrink-0 px-1 ${isActive ? 'bg-gradient-to-br from-[#FF9933] to-[#FF6600] text-black shadow-[0_0_15px_rgba(255,153,51,0.3)] scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'
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