import VideoCard from './VideoCard'

function VideoRow({ series }) {
  if (!series.episodes || series.episodes.length === 0) return null

  return (
    <div className="mb-6 px-4 md:px-8">
      <h3 className="text-sm md:text-lg font-bold mb-2 text-white">{series.title}</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {series.episodes.map(ep => (
          <VideoCard key={ep.id} episode={ep} />
        ))}
      </div>
    </div>
  )
}

export default VideoRow