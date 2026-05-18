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
    <div className="w-full px-6 md:px-0 pt-[60px] sm:pt-[72px] pb-3">
      <div
        className="relative w-full overflow-hidden rounded-2xl md:rounded-none aspect-[2/3] md:aspect-[21/9] lg:aspect-[3/1] shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={series.id}
          src={series.thumbnail_url}
          alt={series.title}
          className="w-full h-full object-cover object-top sm:object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {seriesList.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'bg-[#FF9933] w-6 shadow-[0_0_8px_#FF9933]' : 'bg-white/40 w-1.5'}`}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 lg:px-20 pb-5 md:pb-12 z-10">
          <div className="max-w-2xl">
            {series.category && (
              <span className="text-[#FF9933] text-[10px] md:text-xs font-bold uppercase tracking-widest block mb-2">{series.category}</span>
            )}
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 md:mb-2 leading-tight drop-shadow-lg">{series.title}</h2>
            <p className="text-gray-200 text-xs md:text-base line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 drop-shadow-md">{series.description}</p>
            {firstEpisode && (
              <button
                onClick={() => navigate(`/watch/${firstEpisode.id}`)}
                className="w-full sm:w-auto bg-white text-black px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm tracking-wide hover:bg-gray-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                {isWatched ? 'Continue Watching' : 'Watch Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroBanner