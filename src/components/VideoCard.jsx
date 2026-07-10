import { useNavigate } from 'react-router-dom'
import { haptics } from '../utils/haptics'

function VideoCard({ episode, progress, isLandscape }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => {
        haptics.selection()
        navigate(`/watch/${episode.id}`)
      }}
      className={`cursor-pointer group flex-shrink-0 ${isLandscape ? 'min-w-[200px] max-w-[200px] md:min-w-[280px] md:max-w-[280px]' : 'min-w-[120px] max-w-[120px] md:min-w-[160px] md:max-w-[160px]'}`}
    >
      <div className={`relative overflow-hidden rounded-md ${isLandscape ? 'aspect-video' : 'aspect-[9/16]'}`}>
        <img
          src={episode.thumbnail_url || `https://img.youtube.com/vi/${episode.youtube_id}/hqdefault.jpg`}
          alt={episode.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 backdrop-blur-sm z-10">
            <div 
              className="h-full bg-[#FF9933] shadow-[0_0_10px_rgba(255,153,51,0.5)] transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-black text-sm ml-0.5">&#9654;</span>
          </div>
        </div>
      </div>
      <p className="text-xs mt-1 text-gray-300 group-hover:text-white truncate">
        {episode.title}
      </p>
    </div>
  )
}

export default VideoCard