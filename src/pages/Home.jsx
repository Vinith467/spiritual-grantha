import { useEffect, useState, useCallback } from 'react'

import { supabase } from '../lib/supabase'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import VideoRow from '../components/VideoRow'
import BottomNavbar from '../components/BottomNavbar'
import SkeletonRow from '../components/SkeletonRow'

import VideoCard from '../components/VideoCard'

function Home() {
  const { selectedLang } = useGoogleTranslate()
  const [seriesList, setSeriesList] = useState([])
  const [bannerList, setBannerList] = useState([])
  const [loading, setLoading] = useState(true)
  const [continueWatching, setContinueWatching] = useState([])

  const fetchSeries = useCallback(async () => {
    try {
      const progressData = JSON.parse(localStorage.getItem('sdtv_progress') || '{}')
      const progressList = Object.values(progressData).sort((a, b) => b.updatedAt - a.updatedAt)
      setContinueWatching(progressList)
    } catch (e) {
      console.error('Error loading progress:', e)
    }

    let supabaseSeries = []
    try {
      const { data } = await supabase
        .from('series')
        .select('*, episodes(*)')
        .eq('content_language', selectedLang)
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
        .eq('content_language', selectedLang)
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
  }, [selectedLang])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSeries()
  }, [fetchSeries])

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      <Navbar />
      
      {loading ? (
        <>
          <div className="h-[60vh] w-full bg-white/5 animate-pulse bg-gradient-to-t from-[#141414] to-transparent border-b border-white/5" />
          <div className="pb-10 -mt-4 relative z-10 pt-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </>
      ) : (
        <>
          <HeroBanner seriesList={bannerList} />
          <div className="pb-10 -mt-4 relative z-10">
            {continueWatching.length > 0 && (
              <div className="mb-6 px-4 md:px-8 animate-[fadeIn_0.5s_ease-out]">
                <h3 className="text-sm md:text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="text-[#FF9933] text-lg leading-none">▶</span> Continue Watching
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {continueWatching.map(item => {
                    const progressPercent = item.duration > 0 ? (item.time / item.duration) * 100 : 0
                    return (
                      <VideoCard 
                        key={item.id} 
                        episode={item} 
                        progress={progressPercent}
                      />
                    )
                  })}
                </div>
              </div>
            )}
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