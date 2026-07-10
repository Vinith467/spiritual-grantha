import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import BottomNavbar from '../components/BottomNavbar'
import ComingSoon from '../components/ComingSoon'

const ShortVideo = ({ short, index, activeIndex }) => {
  // Mount the heavy player if it's within 2 slots of the active one (Preloading)
  const isNear = Math.abs(index - activeIndex) <= 2
  const isActive = index === activeIndex
  const iframeRef = useRef(null)
  const { profile } = useAuth()
  const viewRecordIdRef = useRef(null)

  // Lock the initial src so the iframe doesn't reload when isActive changes
  const initialSrc = useRef(`https://www.youtube.com/embed/${short.youtubeId}?enablejsapi=1&autoplay=${isActive ? 1 : 0}&mute=0&controls=1&modestbranding=1&rel=0&iv_load_policy=3&origin=${window.location.origin}`)

  // Use raw YouTube postMessage API to play/pause instantly
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: isActive ? 'playVideo' : 'pauseVideo'
        }), '*')
      } catch (e) {
        console.error('Failed to send postMessage to YouTube iframe', e)
      }
    }
  }, [isActive])

  // Analytics tracking for watch time
  useEffect(() => {
    if (!isActive || !profile?.email) return
    
    viewRecordIdRef.current = null
    
    const interval = setInterval(async () => {
      try {
        if (!viewRecordIdRef.current) {
          const { data } = await supabase.from('video_views').insert([{
            user_email: profile.email,
            video_id: short.youtubeId,
            video_title: short.title || `Short: ${short.youtubeId}`,
            duration_seconds: 10
          }]).select().single()
          if (data) viewRecordIdRef.current = data.id
        } else {
          const { data: current } = await supabase.from('video_views').select('duration_seconds').eq('id', viewRecordIdRef.current).single()
          if (current) {
            await supabase.from('video_views').update({ duration_seconds: current.duration_seconds + 10 }).eq('id', viewRecordIdRef.current)
          }
        }
      } catch (err) {
        console.error('Failed to log short view:', err)
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [isActive, profile?.email, short])

  return (
    <div
      data-index={index}
      className="short-container h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black sm:p-6"
    >
      <div className="relative w-full h-full sm:max-w-md sm:aspect-[9/16] sm:h-[calc(100vh-140px)] sm:rounded-2xl overflow-hidden sm:border sm:border-white/10 sm:shadow-2xl bg-black">
        
        {/* Instagram-style Action Column */}
        <div className={`absolute bottom-24 sm:bottom-12 right-4 z-30 flex flex-col items-center gap-6 pointer-events-auto transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
          <a 
            href={`https://www.youtube.com/shorts/${short.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-[#FF9933]/20 group-hover:border-[#FF9933]/50">
              <span className="text-xl drop-shadow-md group-hover:scale-110 transition-transform">❤️</span>
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md">Like</span>
          </a>

          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: short.title,
                  url: `https://www.youtube.com/shorts/${short.youtubeId}`
                })
              }
            }}
            className="group flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/20">
              <svg className="w-5 h-5 text-white drop-shadow-md group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md">Share</span>
          </button>
        </div>

        {/* Thumbnail Layer - smoothly fades out when active */}
        <div className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 z-10 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
          <img 
            src={`https://img.youtube.com/vi/${short.youtubeId}/hqdefault.jpg`} 
            alt={short.title || "Short Thumbnail"} 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>

        {/* The Player Layer */}
        {isNear && (
          <div className={`absolute inset-0 w-full h-full z-20 ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <iframe
              ref={iframeRef}
              src={initialSrc.current}
              title={short.title}
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Shorts() {
  const { selectedLang, contentLang } = useGoogleTranslate()
  const [shortsData, setShortsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  // Fetch all shorts from Supabase
  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('shorts')
          .select('*')
          .eq('content_language', contentLang)
          .order('created_at', { ascending: false })
        
        if (!error && data) {
          // Bulletproof extraction for YouTube IDs
          const extractYoutubeId = (urlOrId) => {
            if (!urlOrId) return ''
            const clean = urlOrId.trim()
            // 1. Try standard URL formats
            const urlMatch = clean.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*)/)
            if (urlMatch && urlMatch[1].length === 11) return urlMatch[1]
            // 2. Try finding a standalone 11-character YouTube ID (ignores ?si= etc)
            const idMatch = clean.match(/(?:^|[^A-Za-z0-9_-])([A-Za-z0-9_-]{11})(?:[^A-Za-z0-9_-]|$)/)
            return idMatch ? idMatch[1] : clean
          }

          const mapped = data.map(s => ({
            ...s,
            youtubeId: extractYoutubeId(s.youtube_id)
          }))
          setShortsData(mapped)
        }
      } catch (err) {
        console.error('Error fetching shorts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShorts()
  }, [contentLang])

  // Use IntersectionObserver to reliably detect which short is snapped into view
  useEffect(() => {
    if (shortsData.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(index)
          }
        })
      },
      {
        root: null,
        threshold: 0.6, // Trigger when 60% of the short is visible
      }
    )

    const elements = document.querySelectorAll('.short-container')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [shortsData])

  if (loading) return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-white relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-md aspect-[9/16] h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white/5 animate-pulse">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <BottomNavbar />
    </div>
  )

  if (selectedLang === 'kn') return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-white relative overflow-hidden flex items-center justify-center pt-10">
      <ComingSoon language="Kannada" />
      <BottomNavbar />
    </div>
  )

  return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-white relative overflow-hidden">
      
      {/* Scrollable Snap Container */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-20 select-none">
        {shortsData.length === 0 ? (
          <div className="h-[100dvh] flex flex-col items-center justify-center text-gray-500 text-sm p-8 text-center space-y-4">
            <span className="text-3xl">🕉️</span>
            <p className="font-bold text-gray-400">No Shorts Uploaded yet.</p>
            <p className="text-xs text-gray-600 max-w-xs">Upload shorts using the Admin panel to populate this screen!</p>
          </div>
        ) : (
          shortsData.map((short, index) => (
            <ShortVideo 
              key={short.id} 
              short={short} 
              index={index} 
              activeIndex={activeIndex} 
            />
          ))
        )}
      </div>

      {/* Floating Bottom Navbar */}
      <BottomNavbar />

    </div>
  )
}

export default Shorts
