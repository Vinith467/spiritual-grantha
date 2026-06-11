import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import ShareModal from './ShareModal'

function HeroBanner({ seriesList }) {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareData, setShareData] = useState(null)

  // Auto-play timer removed to make banner static
  if (!seriesList || seriesList.length === 0) return <div className="h-64 bg-[#141414]" />

  const lastWatched = JSON.parse(localStorage.getItem('lastWatched') || 'null')

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) {
      setCurrent(c => (c === seriesList.length - 1 ? 0 : c + 1))
    }
    if (diff < -50) {
      setCurrent(c => (c === 0 ? seriesList.length - 1 : c - 1))
    }
    touchStartX.current = null
  }

  return (
    <div className="w-full pt-[60px] sm:pt-[72px] pb-3 overflow-hidden">
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        shareData={shareData} 
      />
      {/* Main Viewport Container */}
      <div className="relative group w-full">
        
        {/* Horizontal Sliding Track */}
        <div
          className="flex w-full transition-transform ease-in-out"
          style={{
            transform: `translate3d(-${current * 100}%, 0px, 0px)`,
            transitionDuration: '2000ms'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {seriesList.map((series) => {
            const firstEpisode = series.episodes?.[0]
            const isWatched = lastWatched && series.episodes?.some(ep => ep.id === lastWatched.id)

            return (
              <div key={series.id} className="w-full shrink-0 flex-none px-6 md:px-0">
                <div className="relative w-full overflow-hidden rounded-2xl md:rounded-none aspect-[2/3] md:aspect-[21/9] lg:aspect-[3/1] shadow-2xl select-none">
                  {/* Banner Image */}
                  <picture>
                    <source media="(min-width: 768px)" srcSet={series.desktop_thumbnail_url || series.thumbnail_url} />
                    <img
                      src={series.thumbnail_url}
                      alt={series.title}
                      className="w-full h-full object-cover object-top sm:object-center"
                      draggable="false"
                    />
                  </picture>

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Content Info Area inside slide */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 lg:px-20 pb-5 md:pb-12 z-10">
                    <div className="max-w-2xl">
                      {series.category && (
                        <span className="text-[#FF9933] text-[10px] md:text-xs font-bold uppercase tracking-widest block mb-2">{series.category}</span>
                      )}
                      <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 md:mb-2 leading-tight drop-shadow-lg">{series.title}</h2>
                      <p className="text-gray-200 text-xs md:text-base line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 drop-shadow-md">{series.description}</p>
                      <div className="flex gap-3 w-full sm:w-auto">
                        {firstEpisode && (
                          <button
                            onClick={() => {
                              if (isWatched) {
                                navigate(`/watch/${lastWatched.id}`)
                              } else {
                                navigate(`/watch/${firstEpisode.id}`)
                              }
                            }}
                            className="flex-[1.5] sm:flex-none justify-center bg-white text-black px-4 sm:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm tracking-wide hover:bg-gray-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
                          >
                            {isWatched ? 'Continue' : 'Watch Now'}
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            const shareUrl = window.location.origin + `/watch/${firstEpisode?.id || ''}`
                            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                            
                            // For Mobile, try native OS Share menu first
                            if (isMobile && navigator.share) {
                              try {
                                let sharedWithFile = false;
                                if (navigator.canShare) {
                                  try {
                                    const response = await fetch(series.thumbnail_url, { mode: 'cors' })
                                    const blob = await response.blob()
                                    const file = new File([blob], 'banner.jpg', { type: blob.type || 'image/jpeg' })
                                    if (navigator.canShare({ files: [file] })) {
                                      await navigator.share({
                                        title: series.title,
                                        text: `Watch ${series.title} on Sanatan Dharma TV\n`,
                                        url: shareUrl,
                                        files: [file]
                                      })
                                      sharedWithFile = true;
                                    }
                                  } catch (e) {
                                    console.warn('Could not fetch image for native sharing', e)
                                  }
                                }
                                if (!sharedWithFile) {
                                  await navigator.share({
                                    title: series.title,
                                    text: `Watch ${series.title} on Sanatan Dharma TV`,
                                    url: shareUrl
                                  })
                                }
                              } catch (error) {
                                console.error('Error sharing natively:', error)
                              }
                            } else {
                              // For Desktop or if native share is not available, show our custom beautiful Share Modal
                              setShareData({
                                title: series.title,
                                url: shareUrl,
                                thumbnail: series.thumbnail_url
                              })
                              setShowShareModal(true)
                            }
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/20 text-white backdrop-blur-md px-4 sm:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm tracking-wide hover:bg-white/30 active:scale-95 transition-all shadow-lg border border-white/10 cursor-pointer"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span className="truncate">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Clickable Navigation Indicators (Fixed) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {seriesList.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 outline-none cursor-pointer ${i === current ? 'bg-[#FF9933] w-6 shadow-[0_0_8px_#FF9933]' : 'bg-white/40 w-1.5 hover:bg-white/80'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Left Navigation Arrow Overlay (Fixed) */}
        {seriesList.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrent(prev => (prev === 0 ? seriesList.length - 1 : prev - 1))
            }}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-[#FF9933] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            aria-label="Previous slide"
          >
            <LeftOutlined className="text-sm md:text-[18px] font-bold" />
          </button>
        )}

        {/* Right Navigation Arrow Overlay (Fixed) */}
        {seriesList.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrent(prev => (prev === seriesList.length - 1 ? 0 : prev + 1))
            }}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-[#FF9933] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            aria-label="Next slide"
          >
            <RightOutlined className="text-sm md:text-[18px] font-bold" />
          </button>
        )}

      </div>
    </div>
  )
}

export default HeroBanner