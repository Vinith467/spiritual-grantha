import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Watch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [episode, setEpisode] = useState(null)

  const fetchEpisode = useCallback(async () => {
    const { data } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()
    setEpisode(data)
    if (data) localStorage.setItem('lastWatched', JSON.stringify(data))
  }, [id])

  useEffect(() => {
    fetchEpisode()
  }, [fetchEpisode])

  if (!episode) return (
    <div className="bg-[#141414] min-h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  )

  return (
    <div className="bg-[#141414] min-h-screen text-white">
      <div className="p-3 md:p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-gray-400 hover:text-white text-sm"
        >
          Back
        </button>
        <div className="aspect-video w-full max-w-5xl mx-auto">
          <iframe
            src={`https://www.youtube.com/embed/${episode.youtube_id}?autoplay=1`}
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="autoplay"
          />
        </div>
        <div className="max-w-5xl mx-auto mt-3 md:mt-4">
          <h1 className="text-lg md:text-2xl font-bold">{episode.title}</h1>
          <p className="text-gray-400 text-sm mt-2">{episode.description}</p>
        </div>
      </div>
    </div>
  )
}

export default Watch