import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNavbar from '../components/BottomNavbar'

function Shorts() {
  const [shortsData, setShortsData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all shorts from Supabase
  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('shorts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!error && data) {
          const mapped = data.map(s => ({
            ...s,
            youtubeId: s.youtube_id
          }))
          setShortsData(mapped)
        }
      } catch (err) {
        console.error('Error fetching shorts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShorts()
  }, [])

  if (loading) return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Loading YouTube Shorts...</p>
    </div>
  )

  return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-white relative overflow-hidden">
      
      {/* Scrollable Snap Container */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-20 select-none">
        {shortsData.length === 0 ? (
          <div className="h-[100dvh] flex flex-col items-center justify-center text-gray-500 text-sm p-8 text-center space-y-4">
            <span className="text-3xl">🕉️</span>
            <p className="font-bold text-gray-400">No Shorts Uploaded yet.</p>
            <p className="text-xs text-gray-600 max-w-xs">Upload shorts using the Admin panel to populate this screen!</p>
          </div>
        ) : (
          shortsData.map((short) => (
            <div
              key={short.id}
              className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black p-4 sm:p-6"
            >
              
              {/* Premium Phone Mockup aspect ratio container for perfect alignment */}
              <div className="relative w-full max-w-md aspect-[9/16] h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                
                {/* Embedded YouTube Shorts Player with native YouTube interactions */}
                <iframe
                  src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&mute=0&loop=1&playlist=${short.youtubeId}&controls=1&modestbranding=0&rel=0&iv_load_policy=3`}
                  title={short.title}
                  className="w-full h-full object-cover pointer-events-auto"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
                
              </div>

            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Navbar */}
      <BottomNavbar />

    </div>
  )
}

export default Shorts
