import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import BottomNavbar from '../components/BottomNavbar'
import YouTube from 'react-youtube'
import { haptics } from '../utils/haptics'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import ComingSoon from '../components/ComingSoon'

function Watch() {
  const { profile } = useAuth()
  const { selectedLang } = useGoogleTranslate()
  const { id } = useParams()
  const navigate = useNavigate()
  const [episode, setEpisode] = useState(null)
  const [seriesEpisodes, setSeriesEpisodes] = useState([])
  const [series, setSeries] = useState(null)
  const [isForceLandscape, setIsForceLandscape] = useState(false)
  const [player, setPlayer] = useState(null)
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  
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

  const viewRecordIdRef = useRef(null)
  const lastSyncTimeRef = useRef(0)

  useEffect(() => {
    if (!player || !episode) return
    const interval = setInterval(async () => {
      try {
        const state = await player.getPlayerState()
        // 1 is Playing
        if (state === 1) {
          // --- ANALYTICS TRACKING ---
          if (profile?.email) {
            const now = Date.now()
            if (now - lastSyncTimeRef.current >= 10000) {
              lastSyncTimeRef.current = now
              if (!viewRecordIdRef.current) {
                const { data } = await supabase.from('video_views').insert([{
                  user_email: profile.email,
                  video_id: episode.youtube_id || episode.id,
                  video_title: episode.title,
                  duration_seconds: 10
                }]).select().single()
                if (data) viewRecordIdRef.current = data.id
              } else {
                const { data: current } = await supabase.from('video_views').select('duration_seconds').eq('id', viewRecordIdRef.current).single()
                if (current) {
                  await supabase.from('video_views').update({ duration_seconds: current.duration_seconds + 10 }).eq('id', viewRecordIdRef.current)
                }
              }
            }
          }
          
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
    viewRecordIdRef.current = null // Reset view record on new video
    lastSyncTimeRef.current = 0
    
    // Resume playback if we have saved progress
    try {
      const progressData = JSON.parse(localStorage.getItem('sdtv_progress') || '{}')
      const savedTime = progressData[id]?.time || 0
      if (savedTime > 0) {
        event.target.seekTo(savedTime, true)
      }
      // Apply current playback speed when video loads
      event.target.setPlaybackRate(playbackSpeed)
    } catch (err) {
      console.error("Error loading progress", err)
    }
  }

  const handleShare = async () => {
    haptics.selection()
    if (navigator.share) {
      try {
        await navigator.share({
          title: episode.title,
          text: episode.description || 'Watch this amazing spiritual content on Omisha and the Inner Path!',
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleOpenYouTube = () => {
    haptics.selection()
    window.open(`https://www.youtube.com/watch?v=${episode.youtube_id}`, '_blank')
  }

  const handleSpeedChange = (speed) => {
    haptics.selection()
    setPlaybackSpeed(speed)
    if (player) {
      player.setPlaybackRate(speed)
    }
    setShowSpeedMenu(false)
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
    } else {
      // Last episode in the series - jump to next playlist!
      const adminVideos = JSON.parse(localStorage.getItem('admin_videos') || '[]')
      if (adminVideos.length > 0) {
        const seriesList = [...new Set(adminVideos.map(v => v.seriesTitle))]
        const currentSeriesIndex = seriesList.indexOf(series?.title)
        
        let nextSeriesTitle = seriesList[0] // Default to first series
        if (currentSeriesIndex !== -1 && currentSeriesIndex < seriesList.length - 1) {
          nextSeriesTitle = seriesList[currentSeriesIndex + 1]
        }
        
        // Find the first video of the next series
        const nextVideo = adminVideos.find(v => v.seriesTitle === nextSeriesTitle)
        if (nextVideo && nextVideo.id !== id) {
          navigate(`/watch/${nextVideo.id}`, { replace: true })
        }
      }
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
        <div className="flex items-start justify-between gap-4 mb-3">
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

        {/* YouTube-style Action Bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {/* Like Button */}
          <button 
            onClick={handleOpenYouTube}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Like
          </button>

          {/* Comment Button */}
          <button 
            onClick={handleOpenYouTube}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comment
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          {/* Speed Button */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                haptics.selection();
                setShowSpeedMenu(!showSpeedMenu);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${showSpeedMenu ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}
            </button>
            
            {/* Speed Menu moved to fixed modal below */}
          </div>
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
                className={`flex gap-3 rounded-xl overflow-hidden cursor-pointer transition relative group
                  ${ep.id === episode.id
                    ? 'bg-gradient-to-r from-[#FF9933]/15 to-transparent border border-[#FF9933]/30 shadow-[inset_0_0_30px_rgba(255,153,51,0.1)]'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-20 md:w-28 aspect-[9/16] rounded-l-xl overflow-hidden shadow-2xl">
                  <img
                    src={ep.thumbnail_url || `https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg`}
                    alt={ep.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${ep.id !== episode.id ? 'group-hover:scale-105' : 'scale-105'}`}
                  />
                  {ep.id === episode.id && (
                    <div className="absolute inset-0 flex flex-col justify-end items-center pb-2 bg-gradient-to-t from-[#141414] via-black/20 to-transparent">
                      <div className="bg-black/60 border border-[#FF9933]/50 px-2 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(255,153,51,0.4)]">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9933] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF9933]"></span>
                        </span>
                        <span className="text-[#FF9933] text-[9px] font-black uppercase tracking-widest leading-none mt-0.5">Playing</span>
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

      {/* Speed Menu Modal */}
      {showSpeedMenu && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSpeedMenu(false)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white">Playback Speed</h3>
              <button onClick={() => {
                haptics.selection()
                setShowSpeedMenu(false)
              }} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${playbackSpeed === speed ? 'bg-white/10 text-white font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                  {playbackSpeed === speed && <svg className="w-5 h-5 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNavbar />
    </div>
  )
}

export default Watch