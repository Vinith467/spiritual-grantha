import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Legend } from 'recharts'
import {
  VideoCameraOutlined,
  CustomerServiceOutlined,
  MobileOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'

function Admin() {
  const navigate = useNavigate()
  // eslint-disable-next-line no-unused-vars
  const [authed, setAuthed] = useState(() => localStorage.getItem('isAdmin') === 'true')
  const [activeTab, setActiveTab] = useState('videos')
  const [timeFilter, setTimeFilter] = useState('daily') // 'daily' | 'weekly' | 'monthly'

  // Loading States
  const [loading, setLoading] = useState(false)

  // Data States
  // eslint-disable-next-line no-unused-vars
  const [banners, setBanners] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [episodesList, setEpisodesList] = useState([])
  const [music, setMusic] = useState([])
  const [shorts, setShorts] = useState([])
  const [profiles, setProfiles] = useState([])
  const [userSessions, setUserSessions] = useState([])
  const [videoViews, setVideoViews] = useState([])

  // Active editing item ID
  const [editingBannerId, setEditingBannerId] = useState(null)
  const [editingSeriesId, setEditingSeriesId] = useState(null)
  const [editingEpisodeId, setEditingEpisodeId] = useState(null)
  const [editingMusicId, setEditingMusicId] = useState(null)
  const [editingShortId, setEditingShortId] = useState(null)

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: null,
    onCloseAction: null
  })

  const showAlert = useCallback((title, message, onClose = null) => {
    setModalConfig({ isOpen: true, type: 'alert', title, message, onConfirm: null, onCloseAction: onClose })
  }, [])

  const showConfirm = useCallback((title, message, onConfirmAction) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, message, onConfirm: onConfirmAction, onCloseAction: null })
  }, [])

  // Video Sub-Tab state: 'episodes' or 'series'
  const [videoSubTab, setVideoSubTab] = useState('episodes')

  // Form States
  const [bannerForm, setBannerForm] = useState({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '', content_language: 'hi' })
  const [seriesForm, setSeriesForm] = useState({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '', content_language: 'hi' })
  const [episodeForm, setEpisodeForm] = useState({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '', content_language: 'hi' })
  const [musicForm, setMusicForm] = useState({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional', content_language: 'hi' })
  const [shortForm, setShortForm] = useState({ title: 'Divine Short', description: '', youtubeId: '', content_language: 'hi' })

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
    
    // Fetch today's sessions
    const today = new Date().toISOString().split('T')[0]
    const { data: sData } = await supabase.from('user_sessions').select('*').eq('session_date', today)
    if (sData) setUserSessions(sData)
    
    // Fetch recent video views (all time for analytics)
    const { data: vData } = await supabase.from('video_views').select('*').order('viewed_at', { ascending: false })
    if (vData) setVideoViews(vData)
  }, [])

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      Promise.all([
        loadBanners(),
        loadSeriesAndEpisodes(),
        loadMusic(),
        loadShorts(),
        loadProfiles()
      ]).finally(() => setLoading(false))
    } else {
      setModalConfig({
        isOpen: true,
        type: 'alert',
        title: 'Access Denied',
        message: 'You are not authorized to view the Admin Dashboard.',
        onCloseAction: () => navigate('/home')
      })
    }
  }, [navigate, loadBanners, loadSeriesAndEpisodes, loadMusic, loadShorts, loadProfiles])

  // ============================================================
  // BANNERS CRUD
  // ============================================================
  // eslint-disable-next-line no-unused-vars
  const handleBannerSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      title: bannerForm.title,
      description: bannerForm.description,
      target_id: bannerForm.targetId,
      mobile_url: bannerForm.mobileUrl,
      desktop_url: bannerForm.desktopUrl,
      content_language: bannerForm.content_language
    }

    try {
      if (editingBannerId) {
        const { error } = await supabase.from('banners').update(payload).eq('id', editingBannerId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('banners').insert([payload])
        if (error) throw error
      }
      setBannerForm({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '', content_language: 'hi' })
      setEditingBannerId(null)
      await loadBanners()
    } catch (err) {
      showAlert('Error', 'Error saving banner: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line no-unused-vars
  const editBanner = (item) => {
    setBannerForm({
      title: item.title || '',
      description: item.description || '',
      targetId: item.target_id || '',
      mobileUrl: item.mobile_url || '',
      desktopUrl: item.desktop_url || '',
      content_language: item.content_language || 'hi'
    })
    setEditingBannerId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // eslint-disable-next-line no-unused-vars
  const deleteBanner = (id) => {
    showConfirm('Delete Banner?', 'Are you sure you want to delete this banner?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('banners').delete().eq('id', id)
        if (error) throw error
        await loadBanners()
      } catch (err) {
        showAlert('Error', 'Error deleting banner: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
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
      desktop_thumbnail_url: seriesForm.desktop_thumbnail_url,
      content_language: seriesForm.content_language
    }

    try {
      if (editingSeriesId) {
        const { error } = await supabase.from('series').update(payload).eq('id', editingSeriesId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('series').insert([payload])
        if (error) throw error
      }
      setSeriesForm({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '', content_language: 'hi' })
      setEditingSeriesId(null)
      await loadSeriesAndEpisodes()
    } catch (err) {
      showAlert('Error', 'Error saving series: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const editSeries = (item) => {
    setSeriesForm({
      title: item.title || '',
      description: item.description || '',
      thumbnail_url: item.thumbnail_url || '',
      desktop_thumbnail_url: item.desktop_thumbnail_url || '',
      content_language: item.content_language || 'hi'
    })
    setEditingSeriesId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteSeries = (id) => {
    showConfirm('Delete Series?', 'Warning: Deleting a series will also orphan or break related episodes. Are you sure you want to delete this series?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('series').delete().eq('id', id)
        if (error) throw error
        await loadSeriesAndEpisodes()
      } catch (err) {
        showAlert('Error', 'Error deleting series: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
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
      description: episodeForm.description,
      content_language: episodeForm.content_language
    }

    try {
      if (editingEpisodeId) {
        const { error } = await supabase.from('episodes').update(payload).eq('id', editingEpisodeId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('episodes').insert([payload])
        if (error) throw error
      }
      setEpisodeForm({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '', content_language: 'hi' })
      setEditingEpisodeId(null)
      await loadSeriesAndEpisodes()
    } catch (err) {
      showAlert('Error', 'Error saving episode: ' + err.message)
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
      description: item.description || '',
      content_language: item.content_language || 'hi'
    })
    setEditingEpisodeId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteEpisode = (id) => {
    showConfirm('Delete Episode?', 'Are you sure you want to delete this episode?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('episodes').delete().eq('id', id)
        if (error) throw error
        await loadSeriesAndEpisodes()
      } catch (err) {
        showAlert('Error', 'Error deleting episode: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
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
      category: musicForm.category,
      content_language: musicForm.content_language
    }

    try {
      if (editingMusicId) {
        const { error } = await supabase.from('music_tracks').update(payload).eq('id', editingMusicId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('music_tracks').insert([payload])
        if (error) throw error
      }
      setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional', content_language: 'hi' })
      setEditingMusicId(null)
      await loadMusic()
    } catch (err) {
      showAlert('Error', 'Error saving music: ' + err.message)
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
      category: item.category || 'Devotional',
      content_language: item.content_language || 'hi'
    })
    setEditingMusicId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteMusic = (id) => {
    showConfirm('Delete Track?', 'Are you sure you want to delete this music track?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('music_tracks').delete().eq('id', id)
        if (error) throw error
        await loadMusic()
      } catch (err) {
        showAlert('Error', 'Error deleting music track: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
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
      youtube_id: shortForm.youtubeId,
      content_language: shortForm.content_language
    }

    try {
      if (editingShortId) {
        const { error } = await supabase.from('shorts').update(payload).eq('id', editingShortId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('shorts').insert([payload])
        if (error) throw error
      }
      setShortForm({ title: 'Divine Short', description: '', youtubeId: '', content_language: 'hi' })
      setEditingShortId(null)
      await loadShorts()
    } catch (err) {
      showAlert('Error', 'Error saving short: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const editShort = (item) => {
    setShortForm({
      title: item.title || 'Divine Short',
      description: item.description || '',
      youtubeId: item.youtube_id || '',
      content_language: item.content_language || 'hi'
    })
    setEditingShortId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteShort = (id) => {
    showConfirm('Delete Short?', 'Are you sure you want to delete this short?', async () => {
      setLoading(true)
      try {
        const { error } = await supabase.from('shorts').delete().eq('id', id)
        if (error) throw error
        await loadShorts()
      } catch (err) {
        showAlert('Error', 'Error deleting short: ' + err.message)
      } finally {
        setLoading(false)
      }
    })
  }

  const cancelEdit = () => {
    setEditingBannerId(null)
    setEditingSeriesId(null)
    setEditingEpisodeId(null)
    setEditingMusicId(null)
    setEditingShortId(null)
    setBannerForm({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '', content_language: 'hi' })
    setSeriesForm({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '', content_language: 'hi' })
    setEpisodeForm({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '', content_language: 'hi' })
    setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional', content_language: 'hi' })
    setShortForm({ title: 'Divine Short', description: '', youtubeId: '', content_language: 'hi' })
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
      const { error } = await supabase.storage
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
      showAlert('Upload Failed', err.message)
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
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Content Language</label>
                      <select value={episodeForm.content_language} onChange={e => setEpisodeForm({ ...episodeForm, content_language: e.target.value })} className="notranslate w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none text-white [&>option]:bg-[#141414] [&>option]:text-white">
                        <option value="hi">Hindi</option>
                        <option value="kn">Kannada</option>
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
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Content Language</label>
                      <select value={seriesForm.content_language} onChange={e => setSeriesForm({ ...seriesForm, content_language: e.target.value })} className="notranslate w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none text-white [&>option]:bg-[#141414] [&>option]:text-white">
                        <option value="hi">Hindi</option>
                        <option value="kn">Kannada</option>
                      </select>
                    </div>
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
              <h2 className="text-xl font-black text-[#FF9933]">{editingMusicId ? 'Edit Devotional Track (Supabase)' : 'Add New Devotional Track (Supabase)'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Content Language</label>
                      <select value={musicForm.content_language} onChange={e => setMusicForm({ ...musicForm, content_language: e.target.value })} className="notranslate w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none text-white [&>option]:bg-[#141414] [&>option]:text-white">
                        <option value="hi">Hindi</option>
                        <option value="kn">Kannada</option>
                      </select>
                    </div>
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
                <button type="submit" disabled={loading} className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition disabled:opacity-50">{editingMusicId ? 'Save Changes' : 'Upload Track'}</button>
                {editingMusicId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
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
              <h2 className="text-xl font-black text-[#FF9933]">{editingShortId ? 'Edit Divine Short (Supabase)' : 'Add New Divine Short (Supabase)'}</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Content Language</label>
                      <select value={shortForm.content_language} onChange={e => setShortForm({ ...shortForm, content_language: e.target.value })} className="notranslate w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none text-white [&>option]:bg-[#141414] [&>option]:text-white">
                        <option value="hi">Hindi</option>
                        <option value="kn">Kannada</option>
                      </select>
                    </div>
                <input required type="text" placeholder="Shorts Title" value={shortForm.title} onChange={e => setShortForm({ ...shortForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <input required type="text" placeholder="YouTube Short ID (e.g. e9GgY2gH_nQ)" value={shortForm.youtubeId} onChange={e => setShortForm({ ...shortForm, youtubeId: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none" />
                <textarea required rows="2" placeholder="Short Description / Hashtags" value={shortForm.description} onChange={e => setShortForm({ ...shortForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-[#FF9933] text-black font-extrabold py-3 rounded-xl hover:bg-[#FF6600] transition disabled:opacity-50">{editingShortId ? 'Save Changes' : 'Upload Short'}</button>
                {editingShortId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>}
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
          const formatDuration = (seconds) => {
            if (!seconds) return '0m';
            const m = Math.floor(seconds / 60);
            return m > 0 ? `${m}m` : `<1m`;
          }

          const isOnline = (lastActiveAt) => {
            if (!lastActiveAt) return false;
            return (new Date() - new Date(lastActiveAt)) < 120000;
          }

          // Compute active users (online now)
          const onlineCount = profiles.filter(p => isOnline(p.last_active_at)).length;
          
          return (
            <div className="animate-fade-in space-y-8 pb-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-2">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  Studio Analytics 📊
                </h2>
                <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                  {['daily', 'weekly', 'monthly'].map(f => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition ${timeFilter === f ? 'bg-[#FF9933] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Processing for Charts */}
              {(() => {
                // Time Bucket Generation
                const generateTimeBuckets = (filter) => {
                  const buckets = [];
                  const now = new Date();
                  
                  if (filter === 'daily') {
                    for (let i = 6; i >= 0; i--) {
                      const d = new Date(now);
                      d.setDate(d.getDate() - i);
                      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const dateKey = d.toISOString().split('T')[0];
                      buckets.push({ label, dateKey, match: (vDate) => vDate.toISOString().split('T')[0] === dateKey, views: 0, minutes: 0 });
                    }
                  } else if (filter === 'weekly') {
                    for (let i = 3; i >= 0; i--) {
                      const d = new Date(now);
                      d.setDate(d.getDate() - (i * 7));
                      const weekStart = new Date(d);
                      weekStart.setDate(d.getDate() - d.getDay()); 
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      const label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                      buckets.push({ 
                        label, 
                        match: (vDate) => vDate.getTime() >= weekStart.getTime() && vDate.getTime() <= weekEnd.getTime() + 86400000, 
                        views: 0, 
                        minutes: 0 
                      });
                    }
                  } else if (filter === 'monthly') {
                    for (let i = 11; i >= 0; i--) {
                      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      buckets.push({
                        label,
                        match: (vDate) => vDate.getMonth() === d.getMonth() && vDate.getFullYear() === d.getFullYear(),
                        views: 0,
                        minutes: 0
                      });
                    }
                  }
                  return buckets;
                };

                const timelineData = generateTimeBuckets(timeFilter);
                let totalFilteredMinutes = 0;
                let totalFilteredViews = 0;
                
                // Aggregate into Timeline and collect active videos for this period
                const activeVideoTimeMap = {};
                
                videoViews.forEach(v => {
                  const vDate = new Date(v.viewed_at || v.created_at || new Date());
                  const bucket = timelineData.find(b => b.match(vDate));
                  if (bucket) {
                    bucket.views += 1;
                    const mins = Math.ceil(v.duration_seconds / 60);
                    bucket.minutes += mins;
                    totalFilteredMinutes += mins;
                    totalFilteredViews += 1;
                    
                    if (!activeVideoTimeMap[v.video_title]) activeVideoTimeMap[v.video_title] = 0;
                    activeVideoTimeMap[v.video_title] += mins;
                  }
                });
                
                const userTotalTime = profiles.map(user => {
                  const session = userSessions.find(s => s.user_email === user.email);
                  const name = user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name;
                  return {
                    name: name,
                    time: session ? Math.ceil(session.duration_seconds / 60) : 0
                  };
                }).sort((a, b) => b.time - a.time).slice(0, 5);

                const videoStats = Object.keys(activeVideoTimeMap).map(title => ({
                  title: title.length > 15 ? title.substring(0, 15) + '...' : title,
                  fullTitle: title,
                  time: activeVideoTimeMap[title]
                })).sort((a, b) => b.time - a.time);

                const topVideos = videoStats.slice(0, 5);
                const bottomVideos = videoStats.length > 5 ? videoStats.slice(-5).reverse() : [];

                return (
                  <div className="space-y-6">
                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-black/40 border border-[#FF9933]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(255,153,51,0.05)]">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Devotees</p>
                        <p className="text-4xl font-black text-white">{profiles.length}</p>
                      </div>
                      <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Watch Time ({timeFilter})</p>
                        <p className="text-4xl font-black text-blue-500">{totalFilteredMinutes} <span className="text-sm font-normal text-gray-500">mins</span></p>
                      </div>
                      <div className="bg-black/40 border border-green-500/30 rounded-2xl p-5 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Online Right Now
                        </p>
                        <p className="text-4xl font-black text-green-500">{onlineCount}</p>
                      </div>
                    </div>

                    {/* Main Timeline Chart */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl">
                      <h4 className="font-bold text-sm text-white uppercase mb-4 tracking-wide flex items-center justify-between">
                        <span>Views & Watch Time Performance</span>
                        <span className="text-xs text-gray-500 font-normal">{totalFilteredViews} Views Total</span>
                      </h4>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF9933" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#FF9933" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            <Area type="monotone" dataKey="minutes" name="Watch Time (Mins)" stroke="#FF9933" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
                            <Area type="monotone" dataKey="views" name="Total Views" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Top Devotees Chart */}
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl">
                        <h4 className="font-bold text-sm text-[#FF9933] uppercase mb-4 tracking-wide">Top Devotees (Today)</h4>
                        <div className="h-64 w-full">
                          {userTotalTime.length > 0 && userTotalTime.some(u => u.time > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={userTotalTime} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '8px' }} />
                                <Bar dataKey="time" radius={[0, 4, 4, 0]}>
                                  {userTotalTime.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#FF9933' : '#FF993380'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">No activity data yet</div>
                          )}
                        </div>
                      </div>

                      {/* Most Played Videos Chart */}
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl">
                        <h4 className="font-bold text-sm text-green-400 uppercase mb-4 tracking-wide">Most Played Videos ({timeFilter})</h4>
                        <div className="h-64 w-full">
                          {topVideos.length > 0 && topVideos.some(v => v.time > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={topVideos} margin={{ top: 20, right: 0, left: 0, bottom: 40 }}>
                                <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} angle={-35} textAnchor="end" />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '8px' }} />
                                <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                                  {topVideos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#22c55e80'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">No video views yet</div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Least Played Videos List */}
                    {bottomVideos.length > 0 && bottomVideos.some(v => v.time < 5) && (
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl">
                        <h4 className="font-bold text-sm text-red-400 uppercase mb-4 tracking-wide">Needs Attention: Least Played Videos</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {bottomVideos.map((video, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                              <span className="text-xs text-gray-300 truncate pr-2" title={video.fullTitle}>{video.fullTitle}</span>
                              <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-md">{video.time}m</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Data Table */}
              <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-white">Devotee Activity</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4">Devotee</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Time Today</th>
                        <th className="px-6 py-4">Recent Watch History</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[...profiles].sort((a, b) => {
                        const aOnline = isOnline(a.last_active_at) ? 1 : 0;
                        const bOnline = isOnline(b.last_active_at) ? 1 : 0;
                        return bOnline - aOnline;
                      }).map(user => {
                        const online = isOnline(user.last_active_at);
                        const session = userSessions.find(s => s.user_email === user.email);
                        const allUserViews = videoViews.filter(v => v.user_email === user.email);
                        
                        return (
                          <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 min-w-[200px]">
                              <div className="flex items-center gap-3">
                                <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-8 h-8 rounded-full bg-white/10 shrink-0 object-cover" />
                                <div>
                                  <div className="font-bold text-white">{user.name}</div>
                                  <div className="text-xs break-all">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {online ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                  Online
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-400 border border-white/10">
                                  Offline
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                              {session ? formatDuration(session.duration_seconds) : '0m'}
                            </td>
                            <td className="px-6 py-4 min-w-[300px]">
                              {allUserViews.length > 0 ? (
                                <details className="group">
                                  <summary className="cursor-pointer text-xs font-bold text-[#FF9933] bg-black/40 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition flex items-center justify-between select-none">
                                    <span>View Full History ({allUserViews.length} Videos)</span>
                                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                  </summary>
                                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {allUserViews.map(v => (
                                      <div key={v.id} className="text-xs flex items-center justify-between gap-4 bg-black/20 p-2 rounded-lg border border-white/5 hover:border-white/10 transition">
                                        <span className="truncate max-w-[200px] text-gray-300" title={v.video_title}>{v.video_title}</span>
                                        <span className="text-[#FF9933] font-bold whitespace-nowrap">{formatDuration(v.duration_seconds)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              ) : (
                                <span className="text-xs text-gray-600 italic">No videos watched yet</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
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



      {/* Custom Admin Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border ${modalConfig.type === 'confirm' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#FF9933]/10 border-[#FF9933]/20 text-[#FF9933]'}`}>
                {modalConfig.type === 'confirm' ? (
                  <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">{modalConfig.title}</h3>
              <p className="text-xs text-gray-400 font-medium">{modalConfig.message}</p>
            </div>
            <div className={`grid ${modalConfig.type === 'confirm' ? 'grid-cols-2 gap-px' : 'grid-cols-1'} bg-white/10 border-t border-white/10`}>
              {modalConfig.type === 'confirm' && (
                <button 
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="bg-[#1a1a1a] p-4 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white transition active:bg-white/10"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => {
                  setModalConfig(prev => ({ ...prev, isOpen: false }))
                  if (modalConfig.type === 'confirm' && modalConfig.onConfirm) {
                    modalConfig.onConfirm()
                  } else if (modalConfig.type === 'alert' && modalConfig.onCloseAction) {
                    modalConfig.onCloseAction()
                  }
                }}
                className={`bg-[#1a1a1a] p-4 text-sm font-bold transition ${modalConfig.type === 'confirm' ? 'text-red-500 hover:bg-red-500/10 active:bg-red-500/20' : 'text-[#FF9933] hover:bg-[#FF9933]/10 active:bg-[#FF9933]/20'}`}
              >
                {modalConfig.type === 'confirm' ? 'Yes, proceed' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin