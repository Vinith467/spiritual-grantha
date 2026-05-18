import { useState, useEffect } from 'react'
import BottomNavbar from '../components/BottomNavbar'
import Navbar from '../components/Navbar'

const DEVOTIONAL_TRACKS = [
  {
    id: 'm1',
    youtubeId: 'AETFvQxK1pE',
    title: 'Hanuman Chalisa',
    singer: 'Hariharan / T-Series',
    duration: '9:41',
    thumbnail: 'https://img.youtube.com/vi/AETFvQxK1pE/hqdefault.jpg',
    category: 'Stotram & Chalisa'
  },
  {
    id: 'm2',
    youtubeId: 'O8_tT0d74l0',
    title: 'Madhurashtakam - Adharam Madhuram',
    singer: 'Devotional Chorus',
    duration: '5:12',
    thumbnail: 'https://img.youtube.com/vi/O8_tT0d74l0/hqdefault.jpg',
    category: 'Krishna Bhajans'
  },
  {
    id: 'm3',
    youtubeId: '8mG862lJ1u8',
    title: 'Achyutam Keshavam Krishna Damodaram',
    singer: 'Shreya Ghoshal',
    duration: '4:35',
    thumbnail: 'https://img.youtube.com/vi/8mG862lJ1u8/hqdefault.jpg',
    category: 'Krishna Bhajans'
  },
  {
    id: 'm4',
    youtubeId: 'A3J3sXpS2pA',
    title: 'Shiva Tandav Stotram',
    singer: 'Shankar Mahadevan',
    duration: '9:15',
    thumbnail: 'https://img.youtube.com/vi/A3J3sXpS2pA/hqdefault.jpg',
    category: 'Shiva Chant'
  },
  {
    id: 'm5',
    youtubeId: 'X9_l2a7s0A4',
    title: 'Shri Ram Chandra Kripalu Bhajman',
    singer: 'Traditional Bhajan',
    duration: '6:02',
    thumbnail: 'https://img.youtube.com/vi/X9_l2a7s0A4/hqdefault.jpg',
    category: 'Ram Bhajans'
  }
]

function Music() {
  const [tracks, setTracks] = useState([])
  const [activeTrack, setActiveTrack] = useState(null)

  useEffect(() => {
    // Load admin music and merge with hardcoded tracks
    const adminMusicRaw = JSON.parse(localStorage.getItem('admin_music') || '[]')
    const adminTracks = adminMusicRaw.map(m => ({
      id: `admin_${m.id}`,
      youtubeId: m.youtubeId,
      title: m.trackTitle,
      singer: m.artist,
      duration: 'Live', // Or some default
      thumbnail: m.coverUrl || `https://img.youtube.com/vi/${m.youtubeId}/hqdefault.jpg`,
      category: 'New Upload'
    }))

    const combinedTracks = [...adminTracks, ...DEVOTIONAL_TRACKS]
    setTracks(combinedTracks)
    if (combinedTracks.length > 0) {
      setActiveTrack(combinedTracks[0])
    }
  }, [])

  if (!activeTrack) return null

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      {/* Top Navbar */}
      <Navbar />

      <div className="px-4 sm:px-6 md:px-8 pt-20 max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Active Player */}
        <div className="flex-1 bg-black/40 backdrop-blur-md border border-[#FF9933]/15 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg">
          <span className="bg-[#FF9933]/15 border border-[#FF9933]/20 px-3 py-1 rounded-full text-xs font-bold text-[#FF9933] mb-4 uppercase tracking-widest">
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
        <div className="flex-1 flex flex-col min-w-0">
          <h3 className="text-sm font-bold text-[#FF9933] mb-4 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
            Devotional Playlist
          </h3>

          <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
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
  )
}

export default Music
