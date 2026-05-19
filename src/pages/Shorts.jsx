import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNavbar from '../components/BottomNavbar'

// Curated high-quality spiritual YouTube Shorts
const SPIRITUAL_SHORTS = [
  {
    id: 's1',
    youtubeId: 'e9GgY2gH_nQ',
    title: 'Divine flute of Lord Krishna',
    description: 'Listen to the beautiful melody that enchanted the entire universe. #Krishna #Spirituality',
    likes: '124K',
  },
  {
    id: 's2',
    youtubeId: 'mPjYg-yB4Yc',
    title: 'Bhagavad Gita Wisdom',
    description: 'Lord Krishna teaching Arjuna the ultimate truth of life on the battlefield of Kurukshetra. #Gita #Wisdom',
    likes: '98K',
  },
  {
    id: 's3',
    youtubeId: '_7zCO-vOQdM',
    title: 'Mahadev Tandav Stotram',
    description: 'The powerful energy of Lord Shiva. Experience the cosmic dance of creation and destruction. #Shiva #Mahadev',
    likes: '256K',
  },
  {
    id: 's4',
    youtubeId: 'l2t9jZq9nS8',
    title: 'Ram Mandir Darshan',
    description: 'Jai Shree Ram! Immersive morning darshan of Ram Lalla in Ayodhya Dham. #RamMandir #Ayodhya',
    likes: '412K',
  }
]

function Shorts() {
  const [shortsData, setShortsData] = useState([])
  const [loading, setLoading] = useState(true)

  // Muted and interactions states
  const [muted, setMuted] = useState(true)
  const [liked, setLiked] = useState(() => {
    return JSON.parse(localStorage.getItem('likedShorts') || '{}')
  })
  const [comments, setComments] = useState(() => {
    return JSON.parse(localStorage.getItem('shortsComments') || '{}')
  })

  // UI state
  const [showComments, setShowComments] = useState(false)
  const [selectedShortId, setSelectedShortId] = useState(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('shorts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!error && data) {
          const dbShorts = data.map(s => ({
            id: s.id,
            youtubeId: s.youtube_id,
            title: s.title || 'Divine Short',
            description: s.description || '',
            likes: '1.5K',
          }))
          setShortsData([...dbShorts, ...SPIRITUAL_SHORTS])
        } else {
          setShortsData(SPIRITUAL_SHORTS)
        }
      } catch (err) {
        console.error(err)
        setShortsData(SPIRITUAL_SHORTS)
      } finally {
        setLoading(false)
      }
    }
    fetchShorts()
  }, [])

  // Save liked state
  const toggleLike = (id) => {
    setLiked(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem('likedShorts', JSON.stringify(next))
      return next
    })
  }

  // Parse and display likes count dynamically
  const getLikesDisplay = (short) => {
    const isLiked = liked[short.id]
    const baseLikes = short.likes || '0'
    if (isLiked) {
      if (baseLikes.endsWith('K')) {
        const val = parseFloat(baseLikes.replace('K', ''))
        return `${(val + 0.1).toFixed(1)}K`
      } else {
        return parseInt(baseLikes) + 1
      }
    }
    return baseLikes
  }

  // Handle Share functionality
  const handleShare = (youtubeId) => {
    const shareUrl = `https://www.youtube.com/shorts/${youtubeId}`
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setToastMessage('Short link copied to clipboard! 📋')
        setTimeout(() => setToastMessage(''), 3000)
      })
      .catch(() => {
        alert('Could not copy link. Share this URL instead: ' + shareUrl)
      })
  }

  // Comments slide-up sheet handlers
  const openComments = (shortId) => {
    setSelectedShortId(shortId)
    setShowComments(true)
  }

  const getActiveComments = () => {
    if (!selectedShortId) return []
    const customList = comments[selectedShortId] || []
    
    // Default spiritual comments based on short ID
    const defaultComments = [
      { id: 'd1', user: 'Sadhaka_Hari', text: 'Hari Om! What an incredibly peaceful vibe this has. 🙏', time: '1d ago' },
      { id: 'd2', user: 'GitaSeeker', text: 'This changed my whole perspective today. Blessed to listen to this! 🌸', time: '12h ago' },
      { id: 'd3', user: 'ShivaShakti', text: 'Jai Mahadev! The energy is cosmic. 🕉️', time: '3h ago' }
    ]

    return [...customList, ...defaultComments]
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!newCommentText.trim() || !selectedShortId) return

    const newCommentObj = {
      id: `c-${Date.now()}`,
      user: 'You',
      text: newCommentText.trim(),
      time: 'Just now'
    }

    setComments(prev => {
      const activeList = prev[selectedShortId] || []
      const next = { ...prev, [selectedShortId]: [newCommentObj, ...activeList] }
      localStorage.setItem('shortsComments', JSON.stringify(next))
      return next
    })

    setNewCommentText('')
  }

  if (loading) return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Loading Divine Shorts...</p>
    </div>
  )

  return (
    <div className="h-[100dvh] w-full bg-black text-white relative overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#FF9933] text-black font-extrabold px-6 py-3 rounded-xl shadow-2xl text-xs tracking-wider animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Scrollable Container */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-16 select-none">
        {shortsData.map((short) => (
          <div
            key={short.id}
            className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black"
          >
            {/* YouTube Shorts Embed */}
            <div className="absolute inset-0 w-full h-[calc(100%-64px)] pb-16">
              <iframe
                src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${short.youtubeId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                title={short.title}
                className="w-full h-full object-cover pointer-events-auto"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>

            {/* Dark Overlay for UI Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

            {/* Sidebar Interactions (Right Side) */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
              
              {/* Mute/Volume Toggle */}
              <button 
                onClick={() => setMuted(!muted)} 
                className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
              >
                <div className={`p-3 rounded-full backdrop-blur-md transition-all ${
                  !muted ? 'bg-[#FF9933]/20 text-[#FF9933]' : 'bg-black/40 text-white'
                }`}>
                  {muted ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-bold">{muted ? 'Muted' : 'Unmuted'}</span>
              </button>

              {/* Like Button */}
              <button 
                onClick={() => toggleLike(short.id)} 
                className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
              >
                <div className={`p-3 rounded-full backdrop-blur-md transition-all ${
                  liked[short.id] ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white'
                }`}>
                  <svg className="w-6 h-6" fill={liked[short.id] ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">{getLikesDisplay(short)}</span>
              </button>

              {/* Comment Button */}
              <button 
                onClick={() => openComments(short.id)} 
                className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
              >
                <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-[#FF9933] transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">Comments</span>
              </button>

              {/* Share Button */}
              <button 
                onClick={() => handleShare(short.youtubeId)} 
                className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
              >
                <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-[#FF9933] transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318m0 7.152l-4.636-2.318M21 12a3 3 0 11-6 0 3 3 0 016 0zm-6-6a3 3 0 11-6 0 3 3 0 016 0zm-6 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">Share</span>
              </button>
            </div>

            {/* Bottom Content Overlay (Left Side) */}
            <div className="absolute left-4 bottom-24 right-16 z-20 pointer-events-none">
              <span className="bg-[#FF9933]/20 border border-[#FF9933]/30 px-3 py-1 rounded-full text-xs font-bold text-[#FF9933] inline-block mb-3 backdrop-blur-md">
                Divine Short
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mb-1 drop-shadow-md truncate">{short.title}</h2>
              <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 drop-shadow-md leading-relaxed">{short.description}</p>
            </div>

          </div>
        ))}
      </div>

      {/* Comments Drawer Sheet */}
      <div className={`fixed inset-x-0 bottom-0 z-50 bg-[#121212] border-t border-white/10 rounded-t-3xl h-[60dvh] flex flex-col transition-all duration-300 ease-out ${
        showComments ? 'translate-y-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'translate-y-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <span className="font-extrabold text-sm text-gray-200">Comments ({getActiveComments().length})</span>
          <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {getActiveComments().length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
              <span>No comments yet.</span>
              <span>Be the first to share your thoughts! 🙏</span>
            </div>
          ) : (
            getActiveComments().map(c => (
              <div key={c.id} className="flex gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-[#FF9933]/20 flex items-center justify-center text-[#FF9933] font-bold shrink-0">
                  {c.user[0].toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-300">{c.user}</span>
                    <span className="text-[10px] text-gray-500">{c.time}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleCommentSubmit} className="p-4 border-t border-white/5 flex gap-3 bg-[#181818] pb-8 sm:pb-4">
          <input
            required
            type="text"
            placeholder="Add a comment spiritually..."
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF9933]/50 outline-none"
          />
          <button type="submit" className="bg-[#FF9933] text-black font-extrabold px-5 py-3 rounded-xl text-xs hover:bg-[#FF6600] transition active:scale-95">
            Post
          </button>
        </form>
      </div>

      {/* Backdrop for Comments */}
      {showComments && (
        <div onClick={() => setShowComments(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" />
      )}

      {/* Floating Bottom Navbar */}
      <BottomNavbar />

    </div>
  )
}

export default Shorts
