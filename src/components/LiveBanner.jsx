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
    <div 
      onClick={() => navigate('/live')}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all group relative overflow-hidden"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="font-black tracking-widest text-sm uppercase">LIVE NOW</span>
        <span className="hidden sm:inline opacity-80 text-sm border-l border-white/30 pl-3 ml-1 truncate">
          {liveStream.title}
        </span>
        <span className="ml-auto bg-black/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider group-hover:bg-black/30 transition-colors">
          Tap to watch
        </span>
      </div>
    </div>
  );
}

export default LiveBanner;
