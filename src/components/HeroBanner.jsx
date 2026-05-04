import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'

function HeroBanner({ seriesList }) {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(null)

  if (!seriesList || seriesList.length === 0) return <div className="h-64 bg-[#141414]" />

  const series = seriesList[current]
  const firstEpisode = series.episodes?.[0]
  const lastWatched = JSON.parse(localStorage.getItem('lastWatched') || 'null')
  const isWatched = lastWatched && series.episodes?.some(ep => ep.id === lastWatched.id)

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50 && current < seriesList.length - 1) setCurrent(c => c + 1)
    if (diff < -50 && current > 0) setCurrent(c => c - 1)
    touchStartX.current = null
  }

  return (
   <div className="px-6 pt-16 pb-3 md:px-64">
      <div
        className="relative rounded-2xl overflow-hidden aspect-[2/3] md:aspect-[16/9] shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={series.id}
          src={series.thumbnail_url}
          alt={series.title}
          className="w-full h-full object-contain"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {seriesList.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'bg-yellow-500 w-6' : 'bg-white/40 w-1.5'}`}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 z-10">
          {series.category && (
            <span className="text-white/70 text-[10px]">{series.category}</span>
          )}
          <h2 className="text-2xl font-black text-white mb-1 leading-tight">{series.title}</h2>
          <p className="text-white/70 text-xs line-clamp-2 mb-4">{series.description}</p>
          {firstEpisode && (
            <button
              onClick={() => navigate(`/watch/${firstEpisode.id}`)}
              className="w-full bg-white text-black py-2.5 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-200 active:scale-95 transition-all"
            >
              {isWatched ? 'Continue Watching' : 'Watch Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeroBanner