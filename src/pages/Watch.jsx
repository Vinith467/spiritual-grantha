import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNavbar from '../components/BottomNavbar'

function Watch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [episode, setEpisode] = useState(null)
  const [seriesEpisodes, setSeriesEpisodes] = useState([])
  const [series, setSeries] = useState(null)
  const hasTriggeredNextRef = useRef(false)
  const iframeRef = useRef(null)
  const playerInstanceRef = useRef(null)

  useEffect(() => {
    hasTriggeredNextRef.current = false
  }, [id])

  const fetchEpisode = useCallback(async () => {
    // 1. Check local admin videos first
    const adminVideos = JSON.parse(localStorage.getItem('admin_videos') || '[]')
    const adminVid = adminVideos.find(v => v.id === id)
    
    if (adminVid) {
      const epData = {
        id: adminVid.id,
        title: adminVid.episodeTitle,
        youtube_id: adminVid.youtubeId,
        series_id: `admin_${adminVid.seriesTitle}`,
        description: ''
      }
      setEpisode(epData)
      localStorage.setItem('lastWatched', JSON.stringify(epData))
      
      const seriesEps = adminVideos
        .filter(v => v.seriesTitle === adminVid.seriesTitle)
        .map((v, i) => ({
          id: v.id,
          title: v.episodeTitle,
          youtube_id: v.youtubeId,
          episode_number: i + 1,
          thumbnail_url: v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
        }))
      setSeries({ title: adminVid.seriesTitle })
      setSeriesEpisodes(seriesEps)
      return
    }

    // 2. Fallback to Supabase
    const { data } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()
      
    setEpisode(data)
    if (data) {
      localStorage.setItem('lastWatched', JSON.stringify(data))
      
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .eq('id', data.series_id)
        .single()
      setSeries(seriesData)

      const { data: episodes } = await supabase
        .from('episodes')
        .select('*')
        .eq('series_id', data.series_id)
        .order('episode_number')
      setSeriesEpisodes(episodes || [])
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEpisode()
  }, [fetchEpisode])

  useEffect(() => {
    // 1. Ensure YouTube script is injected
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    let progressInterval
    let initIntervalId

    const initPlayer = () => {
      if (!iframeRef.current || !window.YT || !window.YT.Player) return

      // Clean up previous instance if any
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch (e) {
          // ignore
        }
        playerInstanceRef.current = null
      }

      playerInstanceRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onReady: () => {
            // Actively poll playback progress every 500ms
            progressInterval = setInterval(() => {
              const player = playerInstanceRef.current
              if (player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
                const currentTime = player.getCurrentTime()
                const duration = player.getDuration()

                if (duration > 0) {
                  const timeRemaining = duration - currentTime
                  // Trigger transition if within 2.0s of ending
                  if (timeRemaining >= 0 && timeRemaining <= 2.0 && !hasTriggeredNextRef.current) {
                    const currentIndex = seriesEpisodes.findIndex(ep => ep.id === id)
                    if (currentIndex !== -1 && currentIndex < seriesEpisodes.length - 1) {
                      hasTriggeredNextRef.current = true
                      clearInterval(progressInterval)
                      const nextEpisode = seriesEpisodes[currentIndex + 1]
                      navigate(`/watch/${nextEpisode.id}`, { replace: true })
                    }
                  }
                }
              }
            }, 500)
          },
          onStateChange: (event) => {
            // Backup check: standard ended state (0)
            if (event.data === 0 && !hasTriggeredNextRef.current) {
              const currentIndex = seriesEpisodes.findIndex(ep => ep.id === id)
              if (currentIndex !== -1 && currentIndex < seriesEpisodes.length - 1) {
                hasTriggeredNextRef.current = true
                if (progressInterval) clearInterval(progressInterval)
                const nextEpisode = seriesEpisodes[currentIndex + 1]
                navigate(`/watch/${nextEpisode.id}`, { replace: true })
              }
            }
          }
        }
      })
    }

    // Wait until YT is ready
    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      initIntervalId = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(initIntervalId)
          initPlayer()
        }
      }, 200)

      const prevCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback()
        initPlayer()
      }
    }

    return () => {
      if (initIntervalId) clearInterval(initIntervalId)
      if (progressInterval) clearInterval(progressInterval)
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch (e) {
          // ignore
        }
        playerInstanceRef.current = null
      }
    }
  }, [id, seriesEpisodes.length, navigate])

  if (!episode) return (
    <div className="bg-[#141414] min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">

      {/* Top bar */}
      <nav className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-black/60 backdrop-blur-md border-b border-[#FF9933]/10 sticky top-0 z-50 transition-all duration-300">
        <button
          onClick={() => navigate(-1)}
          className="text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition active:scale-95 shrink-0 font-bold"
        >
          ←
        </button>
        <img
          src="/icon-192.png"
          alt="Grantha"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#FF9933]/50 shrink-0 shadow-[0_0_15px_rgba(255,153,51,0.2)]"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[#FF9933] text-[10px] sm:text-xs font-black uppercase tracking-wider truncate">{series?.title}</p>
          <p className="text-white text-xs sm:text-sm font-bold truncate">{episode.title}</p>
        </div>
      </nav>
      

      {/* Video Player */}
      <div className="w-full bg-black aspect-video">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${episode.youtube_id}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Episode info */}
      <div className="px-4 py-4 border-b border-white/10">
        <h1 className="text-lg md:text-2xl font-bold mb-1">{episode.title}</h1>
        {episode.description && (
          <p className="text-gray-400 text-sm leading-relaxed">{episode.description}</p>
        )}
      </div>

      {/* More episodes */}
      {seriesEpisodes.length > 1 && (
        <div className="px-4 py-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
            More Episodes — {series?.title}
          </h3>
          <div className="flex flex-col gap-3">
            {seriesEpisodes.map(ep => (
              <div
                key={ep.id}
                onClick={() => ep.id !== episode.id && navigate(`/watch/${ep.id}`, { replace: true })}
                className={`flex gap-3 rounded-xl overflow-hidden cursor-pointer transition
                  ${ep.id === episode.id
                    ? 'bg-white/10 border border-[#FF9933]/50'
                    : 'bg-white/5 hover:bg-white/10'
                  }`}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-36 md:w-48 aspect-video">
                  <img
                    src={ep.thumbnail_url || `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg`}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                  />
                  {ep.id === episode.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {ep.id !== episode.id && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                      <div className="bg-white/80 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-black text-sm ml-0.5">&#9654;</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center py-2 pr-3 flex-1 min-w-0">
                  <p className="text-xs text-[#FF9933] font-bold mb-0.5">
                    EP {ep.episode_number}
                  </p>
                  <p className={`text-sm font-semibold truncate ${ep.id === episode.id ? 'text-[#FF9933]' : 'text-white'}`}>
                    {ep.title}
                  </p>
                  {ep.description && (
                    <p className="text-gray-400 text-xs line-clamp-2 mt-1">{ep.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <BottomNavbar />
    </div>
  )
}

export default Watch