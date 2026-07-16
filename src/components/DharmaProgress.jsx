import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function formatMinsToHours(totalMins) {
  if (!totalMins) return '0m'
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function getLocalYMD(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DharmaProgress() {
  const navigate = useNavigate()
  const [todayWatchMins, setTodayWatchMins] = useState(0)
  const [allTimeWatchMins, setAllTimeWatchMins] = useState(0)
  const [todayLiveMins, setTodayLiveMins] = useState(0)
  const profileEmail = localStorage.getItem('profileEmail')

  useEffect(() => {
    if (!profileEmail) return;

    const fetchWatchTime = async () => {
      try {
        const { data, error } = await supabase
          .from('video_views')
          .select('duration_seconds, viewed_at, created_at')
          .ilike('user_email', profileEmail)
        
        if (!error && data) {
          let todayTime = 0
          let allTime = 0
          const todayStr = getLocalYMD(new Date());

          data.forEach(v => {
            const mins = Math.ceil((v.duration_seconds || 0) / 60);
            allTime += mins;
            const vDateStr = getLocalYMD(v.viewed_at || v.created_at);

            if (vDateStr === todayStr) {
              todayTime += mins;
            }
          })
          
          setTodayWatchMins(todayTime)
          setAllTimeWatchMins(allTime)
        }

        // Fetch Live Stream Time
        const { data: earnData, error: earnError } = await supabase
          .from('earn_sessions')
          .select('created_at, end_time')
          .ilike('devotee_email', profileEmail)
        
        if (!earnError && earnData) {
          let liveMins = 0;
          const todayStr = getLocalYMD(new Date());
          
          earnData.forEach(s => {
            if (getLocalYMD(s.created_at) === todayStr) {
              const start = new Date(s.created_at).getTime();
              const end = s.end_time ? new Date(s.end_time).getTime() : new Date().getTime();
              liveMins += Math.ceil((Math.max(0, (end - start) / 1000)) / 60);
            }
          });
          setTodayLiveMins(liveMins);
        }
      } catch (err) {
        console.error("Error fetching watch time:", err)
      }
    }
    
    // Initial fetch
    fetchWatchTime()

    // Realtime subscription for automatic updates
    const channel = supabase.channel('dharma-progress-updates')
      .on('postgres', { event: '*', schema: 'public', table: 'video_views', filter: `user_email=eq.${profileEmail}` }, () => {
        fetchWatchTime()
      })
      .on('postgres', { event: '*', schema: 'public', table: 'earn_sessions', filter: `devotee_email=eq.${profileEmail}` }, () => {
        fetchWatchTime()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileEmail])

  if (!profileEmail) return null;

  return (
    <div className="space-y-5 px-4 md:px-8 max-w-7xl mx-auto w-full pt-6">
      <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
        <span>📊 Your Dharma Progress</span>
      </h3>
      
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FF9933]/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>

        {/* All-Time Watch Time */}
        <div className="flex justify-between items-center relative z-10 pb-4 border-b border-white/5">
          <div>
            <p className="text-xs font-bold text-[#FF9933] uppercase tracking-wider">Total Watch Time</p>
            <p className="text-[10px] text-gray-500">All-Time</p>
          </div>
          <div className="text-lg font-black text-[#FF9933]">{formatMinsToHours(allTimeWatchMins)}</div>
        </div>

        {/* Today's Watch Time */}
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Watch Time</p>
            <p className="text-[10px] text-gray-500">Daily</p>
          </div>
          <div className="text-lg font-black text-green-400">{formatMinsToHours(todayWatchMins)}</div>
        </div>

        {todayLiveMins > 0 && (
          <div className="pt-4 border-t border-white/5 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Live Seva Today</p>
                <p className="text-[10px] text-gray-500">Streaming Time</p>
              </div>
              <div className="text-lg font-black text-white">{formatMinsToHours(todayLiveMins)}</div>
            </div>
            <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-white/10">
              <div 
                className="h-full rounded-full transition-all duration-1000 bg-blue-500"
                style={{ width: `${Math.min((todayLiveMins / (10 * 60)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Live Seva Stream Start Button */}
        <div className="pt-4 border-t border-white/5 relative z-10">
          <button
            type="button"
            onClick={() => navigate('/earn')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-sm py-3 rounded-xl transition duration-300 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.25)] border border-blue-400/50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Start Live
          </button>
        </div>
      </div>
    </div>
  )
}
