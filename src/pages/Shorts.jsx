import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNavbar from '../components/BottomNavbar'

function Shorts() {
  const [shortsData, setShortsData] = useState([])
  const [loading, setLoading] = useState(true)

  // Muted and liked local states
  const [muted, setMuted] = useState(true)
  const [liked, setLiked] = useState(() => {
    return JSON.parse(localStorage.getItem('likedShorts') || '{}')
  })

  // Comments state synced with Supabase
  const [comments, setComments] = useState({}) // { [shortId]: Array of comments }

  // UI state
  const [showComments, setShowComments] = useState(false)
  const [selectedShortId, setSelectedShortId] = useState(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  // Fetch all shorts from Supabase
  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('shorts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!error && data) {
          setShortsData(data)
        }
      } catch (err) {
        console.error('Error fetching shorts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShorts()
  }, [])

  // Sync likes with Supabase database
  const toggleLike = async (short) => {
    const isLiked = liked[short.id]
    const nextLikedState = !isLiked
    
    // Update local storage liked status
    setLiked(prev => {
      const next = { ...prev, [short.id]: nextLikedState }
      localStorage.setItem('likedShorts', JSON.stringify(next))
      return next
    })

    // Calculate updated count
    const increment = nextLikedState ? 1 : -1
    const currentLikes = short.likes_count || 0
    const targetLikes = Math.max(0, currentLikes + increment)

    // Update local UI state immediately (Optimistic UI)
    setShortsData(prev => prev.map(s => {
      if (s.id === short.id) {
        return { ...s, likes_count: targetLikes }
      }
      return s
    }))

    // Save update to Supabase
    try {
      await supabase
        .from('shorts')
        .update({ likes_count: targetLikes })
        .eq('id', short.id)
    } catch (err) {
      console.error('Failed to sync like count to Supabase:', err)
    }
  }

  // Parse and display likes count
  const getLikesDisplay = (short) => {
    const count = short.likes_count || 0
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
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

  // Fetch comments dynamically for active short from Supabase
  const fetchComments = async (shortId) => {
    setLoadingComments(true)
    try {
      const { data, error } = await supabase
        .from('short_comments')
        .select('*')
        .eq('short_id', shortId)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setComments(prev => ({ ...prev, [shortId]: data }))
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoadingComments(false)
    }
  }

  // Comments slide-up sheet handlers
  const openComments = (shortId) => {
    setSelectedShortId(shortId)
    setShowComments(true)
    fetchComments(shortId)
  }

  const getActiveComments = () => {
    if (!selectedShortId) return []
    return comments[selectedShortId] || []
  }

  // Submit comment to Supabase
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newCommentText.trim() || !selectedShortId) return

    // Generate a beautiful, anonymous spiritual name
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const anonymousUser = `Sadhaka_${randomSuffix}`

    const newCommentObj = {
      short_id: selectedShortId,
      user_name: anonymousUser,
      comment_text: newCommentText.trim()
    }

    try {
      const { data, error } = await supabase
        .from('short_comments')
        .insert([newCommentObj])
        .select()

      if (!error && data) {
        // Prepend comment to state
        setComments(prev => {
          const activeList = prev[selectedShortId] || []
          return { ...prev, [selectedShortId]: [data[0], ...activeList] }
        })
        setNewCommentText('')
      } else {
        throw error || new Error('Failed to post comment')
      }
    } catch (err) {
      alert('Error posting comment: ' + err.message)
    }
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now'
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      return `${diffDays}d ago`
    } catch (e) {
      return 'Recent'
    }
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
        {shortsData.length === 0 ? (
          <div className="h-[100dvh] flex flex-col items-center justify-center text-gray-500 text-sm p-8 text-center space-y-4">
            <span className="text-3xl">🕉️</span>
            <p className="font-bold text-gray-400">No Shorts Uploaded yet.</p>
            <p className="text-xs text-gray-600 max-w-xs">Upload shorts using the Admin panel to populate this screen with beautiful divine highlights!</p>
          </div>
        ) : (
          shortsData.map((short) => (
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
                  onClick={() => toggleLike(short)} 
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
        ))
      )}
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
          {loadingComments ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : getActiveComments().length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center p-4">
              <span>No comments yet.</span>
              <span className="mt-1">Be the first to share your spiritual thoughts! 🙏</span>
            </div>
          ) : (
            getActiveComments().map(c => (
              <div key={c.id} className="flex gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-[#FF9933]/20 flex items-center justify-center text-[#FF9933] font-bold shrink-0">
                  {c.user_name[0].toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-300">{c.user_name}</span>
                    <span className="text-[10px] text-gray-500">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{c.comment_text}</p>
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
