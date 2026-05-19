import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import VideoRow from '../components/VideoRow'
import BottomNavbar from '../components/BottomNavbar'

function Home() {
  const [seriesList, setSeriesList] = useState([])
  const [bannerList, setBannerList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSeries = useCallback(async () => {
    setLoading(true)
    let supabaseSeries = []
    try {
      const { data } = await supabase
        .from('series')
        .select('*, episodes(*)')
        .order('created_at', { ascending: false })
      
      // Sort episodes inside each series by episode_number ascending
      if (data) {
        data.forEach(s => {
          if (s.episodes) {
            s.episodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0))
          }
        })
      }
      supabaseSeries = data || []
    } catch (e) {
      console.error('Error fetching from supabase:', e)
    }

    let supabaseBanners = []
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })
      supabaseBanners = data || []
    } catch (e) {
      console.error('Error fetching banners:', e)
    }

    setSeriesList(supabaseSeries)

    if (supabaseBanners.length > 0) {
      const customBanners = supabaseBanners.map(b => ({
        id: b.id,
        title: b.title,
        description: b.description,
        category: 'Featured',
        thumbnail_url: b.mobile_url,
        desktop_thumbnail_url: b.desktop_url,
        episodes: [{ id: b.target_id }]
      }))
      setBannerList(customBanners)
    } else {
      setBannerList(supabaseSeries)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      <Navbar />
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <HeroBanner seriesList={bannerList} />
          <div className="pb-10 -mt-4 relative z-10">
            {seriesList.map(series => (
              <VideoRow key={series.id} series={series} />
            ))}
          </div>
        </>
      )}
      
      <BottomNavbar />
    </div>
  )
}

export default Home