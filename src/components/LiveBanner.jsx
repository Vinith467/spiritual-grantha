import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

function LiveBanner() {
  const [liveStream, setLiveStream] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch
    fetchLiveStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('live_streams_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_streams' },
        (payload) => {
          // Whenever ANY change happens, just re-fetch the latest
          fetchLiveStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setLiveStream(data);
      } else {
        setLiveStream(null);
      }
    } catch (err) {
      console.error('Error fetching live status:', err);
    }
  };

  if (!liveStream) return null;

  return (
    <div className="px-6 md:px-0 max-w-7xl mx-auto mb-4 w-full">
      <div 
        onClick={() => navigate('/live')}
        className="bg-[#FF0000] hover:bg-red-600 text-white rounded-2xl cursor-pointer shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 relative z-10 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex h-4 w-4 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1">Live Broadcast</span>
              <h3 className="font-black text-lg sm:text-xl truncate w-full max-w-[250px] sm:max-w-md">
                {liveStream.title}
              </h3>
            </div>
          </div>
          
          <div className="shrink-0 w-full sm:w-auto text-center bg-white text-red-600 font-bold px-6 py-2 rounded-xl text-sm shadow-md">
            Watch Now
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveBanner;
