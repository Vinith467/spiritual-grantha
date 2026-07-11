import { useEffect, useState, useCallback } from 'react'

import { supabase } from '../lib/supabase'
import { useGoogleTranslate } from '../lib/useGoogleTranslate'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import VideoRow from '../components/VideoRow'
import BottomNavbar from '../components/BottomNavbar'
import SkeletonRow from '../components/SkeletonRow'
import ComingSoon from '../components/ComingSoon'

import VideoCard from '../components/VideoCard'

function Home() {
  const { selectedLang, contentLang } = useGoogleTranslate()
  const [seriesList, setSeriesList] = useState([])
  const [bannerList, setBannerList] = useState([])
  const [loading, setLoading] = useState(true)
  const [liveStream, setLiveStream] = useState(null)

  const fetchSeries = useCallback(async () => {


    let supabaseSeries = []
    try {
      const { data } = await supabase
        .from('series')
        .select('*, episodes(*)')
        .eq('content_language', contentLang)
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
        .eq('content_language', contentLang)
        .order('created_at', { ascending: false })
      supabaseBanners = data || []
    } catch (e) {
      console.error('Error fetching banners:', e)
    }

    let activeLiveStream = null
    try {
      const { data } = await supabase
        .from('live_streams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) {
        activeLiveStream = data
        setLiveStream(data)
      }
    } catch (e) {
      if (e.code !== 'PGRST116') console.error('Error fetching live stream:', e)
    }

    setSeriesList(supabaseSeries)

    let finalBanners = []
    if (supabaseBanners.length > 0) {
      finalBanners = supabaseBanners.map(b => ({
        id: b.id,
        title: b.title,
        description: b.description,
        category: 'Featured',
        thumbnail_url: b.mobile_url,
        desktop_thumbnail_url: b.desktop_url,
        episodes: [{ id: b.target_id }]
      }))
    } else {
      finalBanners = [...supabaseSeries]
    }

    if (activeLiveStream) {
      finalBanners.unshift({
        id: 'live-' + activeLiveStream.id,
        title: activeLiveStream.title,
        description: activeLiveStream.description || 'Join the live broadcast now',
        category: 'LIVE BROADCAST',
        thumbnail_url: `https://img.youtube.com/vi/${activeLiveStream.youtube_id}/hqdefault.jpg`,
        desktop_thumbnail_url: `https://img.youtube.com/vi/${activeLiveStream.youtube_id}/hqdefault.jpg`,
        isLive: true,
        episodes: [] // No episodes needed
      })
    }

    setBannerList(finalBanners)
    setLoading(false)
  }, [contentLang])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSeries()

    const channel = supabase
      .channel('home_live_streams')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_streams' },
        () => fetchSeries()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSeries])

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-24">
      <Navbar />
      
      {selectedLang === 'kn' ? (
        <div className="pt-20">
          <ComingSoon language="Kannada" />
        </div>
      ) : loading ? (
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