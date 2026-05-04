import { useNavigate } from 'react-router-dom'

function VideoCard({ episode }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/watch/${episode.id}`)}
      className="min-w-[120px] max-w-[120px] md:min-w-[160px] md:max-w-[160px] cursor-pointer group flex-shrink-0"
    >
      <div className="relative overflow-hidden rounded-md aspect-[2/3]">
        <img
          src={episode.thumbnail_url || `https://img.youtube.com/vi/${episode.youtube_id}/hqdefault.jpg`}
          alt={episode.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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