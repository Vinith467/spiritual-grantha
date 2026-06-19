import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import BottomNavbar from '../components/BottomNavbar'
import Navbar from '../components/Navbar'
import ComingSoon from '../components/ComingSoon'

function Music() {
  const { selectedLang, contentLang } = useGoogleTranslate()
  const [tracks, setTracks] = useState([])
  const [activeTrack, setActiveTrack] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('music_tracks')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!error && data) {
          const dbTracks = data.map(m => ({
            id: m.id,
            youtubeId: m.youtube_id,
            title: m.track_title,
            singer: m.artist,
            duration: 'Live',
            thumbnail: m.cover_url || `https://img.youtube.com/vi/${m.youtube_id}/hqdefault.jpg`,
            category: m.category || 'Devotional'
          }))
          setTracks(dbTracks)
          if (dbTracks.length > 0) {
            setActiveTrack(dbTracks[0])
          } else {
            setActiveTrack(null)
          }
        } else {
          setTracks([])
          setActiveTrack(null)
        }
      } catch (err) {
        console.error(err)
        setTracks([])
        setActiveTrack(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMusic()
  }, [contentLang])

  if (loading) return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      <Navbar />
      <div className="px-4 sm:px-6 md:px-8 pt-20 max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white/5 rounded-2xl p-4 sm:p-6 shadow-lg animate-pulse h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          {[1,2,3,4].map(i => (
             <div key={i} className="flex gap-3 items-center rounded-xl p-2.5 bg-white/5 h-20 animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
             </div>
          ))}
        </div>
      </div>
      <BottomNavbar />
    </div>
  )

  if (selectedLang === 'kn') return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      <Navbar />
      <div className="pt-20">
        <ComingSoon language="Kannada" />
      </div>
      <BottomNavbar />
    </div>
  )

  if (!activeTrack) return (
    <div className="bg-[#141414] min-h-screen text-white pb-24 flex items-center justify-center">
      <Navbar />
      <div className="text-center p-8 space-y-4">
        <span className="text-4xl">🎵</span>
        <p className="font-bold text-gray-400">No Devotional Tracks Uploaded.</p>
        <p className="text-xs text-gray-600 max-w-xs mx-auto">Upload music using the Admin panel to populate this screen!</p>
      </div>
      <BottomNavbar />
    </div>
  )

  return (
    <div className="relative min-h-screen text-white pb-24 bg-[#141414]">
      {/* Dynamic Background Image */}
      {activeTrack && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-110 opacity-30 blur-[60px]"
            style={{ backgroundImage: `url(${activeTrack.thumbnail})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#141414]/80 to-[#141414]" />
        </div>
      )}

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Top Navbar */}
        <Navbar />

        <div className="px-4 sm:px-6 md:px-8 pt-24 pb-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Left Side: Active Player */}
        <div className="w-full md:w-80 lg:w-[400px] shrink-0 bg-black/40 backdrop-blur-md border border-[#FF9933]/15 rounded-3xl p-5 sm:p-6 flex flex-col items-center shadow-2xl md:sticky md:top-28 h-fit">
          <span className="bg-[#FF9933]/15 border border-[#FF9933]/20 px-3 py-1 rounded-full text-xs font-bold text-[#FF9933] mb-5 uppercase tracking-widest">
            Now Playing
          </span>

          {/* Embedded YouTube Audio Player */}
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-5 border border-white/5 shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${activeTrack.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={activeTrack.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>

          <div className="text-center w-full min-w-0">
            <h2 className="text-xl font-black text-white mb-1 truncate drop-shadow-md">{activeTrack.title}</h2>
            <p className="text-gray-400 text-sm font-semibold truncate mb-4">{activeTrack.singer}</p>
            
            {/* Visualizer / Decorative element */}
            <div className="flex items-center justify-center gap-1.5 h-6">
              <span className="w-1 h-3 bg-[#FF9933] rounded animate-[pulse_1s_infinite]" />
              <span className="w-1 h-5 bg-[#FF9933] rounded animate-[pulse_0.8s_infinite_delay-100]" />
              <span className="w-1 h-6 bg-[#FF9933] rounded animate-[pulse_0.6s_infinite_delay-200]" />
              <span className="w-1 h-4 bg-[#FF9933] rounded animate-[pulse_0.7s_infinite_delay-300]" />
              <span className="w-1 h-2 bg-[#FF9933] rounded animate-[pulse_0.9s_infinite_delay-400]" />
            </div>
          </div>
        </div>

        {/* Right Side: Devotional Playlist */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/20 rounded-3xl p-4 sm:p-6 border border-white/5">
          <h3 className="text-sm font-bold text-[#FF9933] mb-6 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
            Devotional Playlist ({tracks.length})
          </h3>

          <div className="flex flex-col gap-3">
            {tracks.map(track => {
              const isSelected = track.id === activeTrack.id
              return (
                <div
                  key={track.id}
                  onClick={() => setActiveTrack(track)}
                  className={`flex gap-3 items-center rounded-xl p-2.5 cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? 'bg-[#FF9933]/15 border-[#FF9933]/45 shadow-[0_0_15px_rgba(255,153,51,0.1)]'
                      : 'bg-white/5 hover:bg-white/10 border-transparent'
                  }`}
                >
                  {/* Thumbnail / Play Button */}
                  <div className="relative w-16 sm:w-20 aspect-video rounded-lg overflow-hidden shrink-0">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#FF9933]/50 flex items-center justify-center">
                        <span className="text-black text-sm">&#9654;</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#FF9933] font-bold uppercase tracking-wider block mb-0.5">
                      {track.category}
                    </span>
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#FF9933]' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-gray-400 text-xs truncate mt-0.5">{track.singer}</p>
                  </div>

                  {/* Duration */}
                  <span className="text-gray-500 text-xs font-bold shrink-0">{track.duration}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

        {/* Floating Bottom Navbar */}
        <BottomNavbar />
      </div>
    </div>
  )
}

export default Music
