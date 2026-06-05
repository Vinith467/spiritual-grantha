import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNavbar from '../components/BottomNavbar'
import YouTube from 'react-youtube'
import { haptics } from '../utils/haptics'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import ComingSoon from '../components/ComingSoon'

function Watch() {
  const { selectedLang } = useGoogleTranslate()
  const { id } = useParams()
  const navigate = useNavigate()
  const [episode, setEpisode] = useState(null)
  const [seriesEpisodes, setSeriesEpisodes] = useState([])
  const [series, setSeries] = useState(null)
  const [isForceLandscape, setIsForceLandscape] = useState(false)
  const [player, setPlayer] = useState(null)
  
  const [watchedEpisodes, setWatchedEpisodes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('watched_episodes') || '[]')
    } catch {
      return []
    }
  })
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
    if (!player || !episode) return
    const interval = setInterval(async () => {
      try {
        const state = await player.getPlayerState()
        // 1 is Playing
        if (state === 1) {
          const currentTime = await player.getCurrentTime()
          const duration = await player.getDuration()
          
          if (currentTime > 0 && duration > 0) {
            const progressData = JSON.parse(localStorage.getItem('sdtv_progress') || '{}')
            
            // If they are within 10 seconds of the end, remove it from continue watching
            if (currentTime > duration - 10) {
              delete progressData[id]
            } else {
              progressData[id] = {
                id: episode.id,
                youtube_id: episode.youtube_id,
                title: episode.title,
                series_title: series?.title || '',
                time: currentTime,
                duration: duration,
                updatedAt: Date.now(),
                thumbnail_url: episode.thumbnail_url || `https://img.youtube.com/vi/${episode.youtube_id}/hqdefault.jpg`
              }
            }
            localStorage.setItem('sdtv_progress', JSON.stringify(progressData))
          }
        }
      } catch (err) {
        console.error("Error saving progress", err)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [player, id, episode, series])

  const handlePlayerReady = (event) => {
    setPlayer(event.target)
    
    // Resume playback if we have saved progress
    try {
      const progressData = JSON.parse(localStorage.getItem('sdtv_progress') || '{}')
      const savedTime = progressData[id]?.time || 0
      if (savedTime > 0) {
        event.target.seekTo(savedTime, true)
      }
    } catch (err) {
      console.error("Error loading progress", err)
    }
  }

  const handleVideoEnd = () => {
    const watched = JSON.parse(localStorage.getItem('watched_episodes') || '[]')
    if (!watched.includes(id)) {
      watched.push(id)
      localStorage.setItem('watched_episodes', JSON.stringify(watched))
      setWatchedEpisodes(watched)
    }

    const currentIndex = seriesEpisodes.findIndex(ep => ep.id === id)
    if (currentIndex !== -1 && currentIndex < seriesEpisodes.length - 1) {
      const nextEpisode = seriesEpisodes[currentIndex + 1]
      navigate(`/watch/${nextEpisode.id}`, { replace: true })
    }
  }

  if (!episode) return (
    <div className="bg-[#141414] min-h-screen text-white pb-24 flex flex-col">
      <nav className="flex items-center gap-3 px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-24 h-3 bg-white/5 animate-pulse rounded" />
          <div className="w-48 h-4 bg-white/5 animate-pulse rounded" />
        </div>
      </nav>
      <div className="w-full aspect-video bg-white/5 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="px-4 py-4 border-b border-white/5 space-y-3">
        <div className="w-3/4 h-6 bg-white/5 animate-pulse rounded" />
        <div className="w-full h-4 bg-white/5 animate-pulse rounded" />
        <div className="w-2/3 h-4 bg-white/5 animate-pulse rounded" />
      </div>
    </div>
  )

  if (selectedLang === 'kn') return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      <nav className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-black/60 backdrop-blur-md border-b border-[#FF9933]/10 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="group relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0">
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      </nav>
      <div className="pt-20">
        <ComingSoon language="Kannada" />
      </div>
      <BottomNavbar />
    </div>
  )

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">

      {/* Top bar */}
      <nav className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-black/60 backdrop-blur-md border-b border-[#FF9933]/10 sticky top-0 z-50 transition-all duration-300">
        <button
          onClick={() => {
            haptics.selection()
            navigate(-1)
          }}
          className="group relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-300 active:scale-90 shrink-0 shadow-lg hover:shadow-white/5"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
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
      <div 
        className={isForceLandscape 
          ? "fixed top-0 left-0 w-[100vh] h-[100vw] z-[9999] origin-top-left bg-black" 
          : "w-full bg-black aspect-video relative"
        }
        style={isForceLandscape ? { transform: 'rotate(90deg) translateY(-100%)' } : {}}
      >
        {isForceLandscape && (
          <button 
            onClick={() => {
              haptics.selection()
              setIsForceLandscape(false)
            }}
            className="absolute top-6 right-6 z-[10000] w-12 h-12 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group"
          >
            <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <YouTube
          videoId={episode.youtube_id}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              rel: 0,
              modestbranding: 1
            },
          }}
          className="w-full h-full"
          onReady={handlePlayerReady}
          onEnd={handleVideoEnd}
        />
      </div>

      {/* Episode info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-lg md:text-2xl font-bold">{episode.title}</h1>
          <button 
            onClick={() => {
              haptics.selection()
              setIsForceLandscape(true)
            }}
            className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border border-white/10 active:scale-95"
          >
            <span className="text-lg leading-none mb-0.5">⤢</span> Rotate
          </button>
        </div>
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
                onClick={() => {
                  if (ep.id !== episode.id) {
                    haptics.selection()
                    navigate(`/watch/${ep.id}`, { replace: true })
                  }
                }}
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
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                      <div className="bg-black/60 border border-[#FF9933]/50 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(255,153,51,0.3)]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9933] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9933]"></span>
                        </span>
                        <span className="text-[#FF9933] text-[10px] font-black uppercase tracking-widest">Playing</span>
                      </div>
                    </div>
                  )}
                  {ep.id !== episode.id && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                      <div className="bg-white/80 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-black text-sm ml-0.5">&#9654;</span>
                      </div>
                    </div>
                  )}
                  {watchedEpisodes.includes(ep.id) && ep.id !== episode.id && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1 shadow-sm">
                      <span className="text-[#4CAF50] text-[10px] font-bold">✓</span>
                      <span className="text-gray-300 text-[8px] font-bold uppercase tracking-wider">Watched</span>
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