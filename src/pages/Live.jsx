import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { supabase } from '../lib/supabase';
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';

function Live() {
  const navigate = useNavigate();
  const [liveStream, setLiveStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);

  useEffect(() => {
    fetchLiveStatus();

    const channel = supabase
      .channel('live_streams_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_streams' },
        (payload) => {
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
        // If stream ends while watching, go back home
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error('Error fetching live status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReady = (e) => {
    playerRef.current = e.target;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <LoadingOutlined className="text-[#FF9933] text-4xl animate-spin" />
      </div>
    );
  }

  if (!liveStream) return null; // will redirect in fetch

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col animate-in fade-in duration-500 pt-[60px] sm:pt-[68px]">
      <Navbar />
      
      {/* Header */}
      <div className="sticky top-[60px] sm:top-[68px] z-40 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ArrowLeftOutlined className="text-white text-lg" />
          </button>
          <div className="flex items-center gap-2">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
             </span>
             <h1 className="text-lg font-black text-white truncate max-w-[200px] md:max-w-md uppercase tracking-tight">
               {liveStream.title}
             </h1>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row bg-black">
        
        {/* Main Video Area */}
        <div className="w-full md:w-3/4 aspect-video bg-black sticky top-[120px] md:relative z-30 shadow-2xl">
          <YouTube 
            videoId={liveStream.youtube_id} 
            opts={opts} 
            onReady={handleReady}
            className="w-full h-full absolute inset-0"
            iframeClassName="w-full h-full"
          />
        </div>

        {/* Live Chat Area (Embed) */}
        <div className="w-full md:w-1/4 h-[400px] md:h-auto bg-[#141414] border-t md:border-t-0 md:border-l border-white/10 relative">
          <iframe 
             src={`https://www.youtube.com/live_chat?v=${liveStream.youtube_id}&embed_domain=${window.location.hostname}`}
             className="w-full h-full absolute inset-0 border-0"
             title="YouTube Live Chat"
          ></iframe>
        </div>

      </div>
    </div>
  );
}

export default Live;
