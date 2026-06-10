import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import BottomNavbar from '../components/BottomNavbar'
import ComingSoon from '../components/ComingSoon'

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
            <div
              key={short.id}
              data-index={index}
              className="short-container h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black p-4 sm:p-6"
            >
              
              {/* Premium Phone Mockup aspect ratio container for perfect alignment */}
              <div className="relative w-full max-w-md aspect-[9/16] h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                
                {/* Subtle Floating Like & Interact on YouTube Button */}
                <a 
                  href={`https://www.google.com/url?q=https://www.youtube.com/shorts/${short.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/75 hover:bg-black backdrop-blur-md border border-white/10 hover:border-[#FF9933]/50 text-white hover:text-[#FF9933] px-4 py-2.5 rounded-full text-xs font-extrabold transition-all active:scale-95 shadow-xl pointer-events-auto select-none"
                >
                  <span>Like on YouTube</span>
                  <span className="text-red-500 text-sm animate-pulse">❤️</span>
                </a>

                {/* Embedded YouTube Shorts Player with native YouTube interactions */}
                {index === activeIndex ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&mute=0&loop=1&playlist=${short.youtubeId}&controls=1&modestbranding=0&rel=0&iv_load_policy=3`}
                    title={short.title}
                    className="w-full h-full object-cover pointer-events-auto"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full relative pointer-events-none">
                    <img 
                      src={`https://img.youtube.com/vi/${short.youtubeId}/hqdefault.jpg`} 
                      alt={short.title || "Short Thumbnail"} 
                      className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
                
              </div>

            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Navbar */}
      <BottomNavbar />

    </div>
  )
}

export default Shorts
