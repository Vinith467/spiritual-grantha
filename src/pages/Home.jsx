import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import VideoRow from '../components/VideoRow'
import BottomNavbar from '../components/BottomNavbar'

function ContinueCard({ episode }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/watch/${episode.id}`)}
      className="min-w-[120px] max-w-[120px] md:min-w-[160px] cursor-pointer group flex-shrink-0"
    >
      <div className="relative overflow-hidden rounded-md aspect-[2/3]">
        <img
          src={`https://img.youtube.com/vi/${episode.youtube_id}/hqdefault.jpg`}
          alt={episode.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-black text-sm ml-0.5">&#9654;</span>
          </div>
        </div>
      </div>
      <p className="text-xs mt-1 text-gray-300 truncate">{episode.title}</p>
    </div>
  )
}

function Home() {
  const [seriesList, setSeriesList] = useState([])
  const [lastWatched, setLastWatched] = useState(null)

  const fetchSeries = useCallback(async () => {
    let supabaseSeries = []
    try {
      const { data } = await supabase
        .from('series')
        .select('*, episodes(*)')
        .order('created_at', { ascending: false })
      supabaseSeries = data || []
    } catch (e) {
      console.error('Error fetching from supabase:', e)
    }

    // Load admin uploaded videos from localStorage
    const adminVideos = JSON.parse(localStorage.getItem('admin_videos') || '[]')
    const adminSeriesMap = {}

    adminVideos.forEach(v => {
      if (!adminSeriesMap[v.seriesTitle]) {
        adminSeriesMap[v.seriesTitle] = {
          id: `admin_${v.seriesTitle}`,
          title: v.seriesTitle,
          episodes: []
        }
      }
      adminSeriesMap[v.seriesTitle].episodes.push({
        id: v.id,
        title: v.episodeTitle,
        youtube_id: v.youtubeId,
        thumbnail_url: v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
        desktop_thumbnail_url: v.desktopThumbnailUrl || v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
      })
    })

    // Add thumbnail_url to the adminSeriesMap root so HeroBanner can display it
    Object.keys(adminSeriesMap).forEach(key => {
      const firstEp = adminSeriesMap[key].episodes[0]
      if (firstEp) {
        adminSeriesMap[key].thumbnail_url = firstEp.thumbnail_url
        adminSeriesMap[key].desktop_thumbnail_url = firstEp.desktop_thumbnail_url
      }
    })

    // Merge Supabase and LocalStorage series
    const combinedData = [...supabaseSeries, ...Object.values(adminSeriesMap)]
    setSeriesList(combinedData)
  }, [])

  useEffect(() => {
    fetchSeries()
    const lw = localStorage.getItem('lastWatched')
    if (lw) setLastWatched(JSON.parse(lw))
  }, [fetchSeries])

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      <Navbar />
      <HeroBanner seriesList={seriesList} />
      <div className="pb-10 -mt-4 relative z-10">
        {seriesList.map(series => (
          <VideoRow key={series.id} series={series} />
        ))}
      </div>
      <BottomNavbar />
    </div>
  )
}

export default Home