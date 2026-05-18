import { useState, useEffect } from 'react'
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
  const [activeShort, setActiveShort] = useState(0)
  const [liked, setLiked] = useState({})

  const toggleLike = (id) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="h-[100dvh] w-full bg-black text-white relative overflow-hidden">
      
      {/* Scrollable Container */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-16">
        {SPIRITUAL_SHORTS.map((short, index) => (
          <div
            key={short.id}
            className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black"
          >
            {/* YouTube Shorts Embed */}
            <div className="absolute inset-0 w-full h-[calc(100%-64px)] pb-16">
              <iframe
                src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${short.youtubeId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
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
              {/* Like Button */}
              <button 
                onClick={() => toggleLike(short.id)} 
                className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
              >
                <div className={`p-3 rounded-full backdrop-blur-md transition-all ${
                  liked[short.id] ? 'bg-[#FF9933]/20 text-[#FF9933]' : 'bg-black/40 text-white'
                }`}>
                  <svg className="w-6 h-6" fill={liked[short.id] ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">{liked[short.id] ? 'Liked' : short.likes}</span>
              </button>

              {/* Comment Button */}
              <div className="flex flex-col items-center gap-1">
                <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">Comments</span>
              </div>

              {/* Share Button */}
              <div className="flex flex-col items-center gap-1">
                <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318m0 7.152l-4.636-2.318M21 12a3 3 0 11-6 0 3 3 0 016 0zm-6-6a3 3 0 11-6 0 3 3 0 016 0zm-6 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">Share</span>
              </div>
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

      {/* Floating Bottom Navbar */}
      <BottomNavbar />

    </div>
  )
}

export default Shorts
