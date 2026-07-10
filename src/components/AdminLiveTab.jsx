import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';

function AdminLiveTab() {
  const [loading, setLoading] = useState(true);
  const [liveStream, setLiveStream] = useState(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    loadLiveStream();
  }, []);

  const loadLiveStream = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // ignore no rows
      if (data) {
        setLiveStream(data);
        setUrl(`https://youtube.com/watch?v=${data.youtube_id}`);
        setTitle(data.title);
      }
    } catch (err) {
      console.error('Error loading live stream:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (input) => {
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const handleToggleLive = async (makeActive) => {
    if (makeActive) {
      if (!url.trim() || !title.trim()) {
        alert("Please provide both a Title and a YouTube Live URL.");
        return;
      }
      const videoId = extractVideoId(url);
      if (!videoId) {
        alert("Invalid YouTube URL");
        return;
      }

      try {
        setLoading(true);
        const payload = {
          youtube_id: videoId,
          title: title,
          is_active: true,
          created_at: new Date().toISOString()
        };

        if (liveStream?.id) {
          await supabase.from('live_streams').update(payload).eq('id', liveStream.id);
        } else {
          await supabase.from('live_streams').insert([payload]);
        }
        await loadLiveStream();
      } catch (err) {
        console.error("Failed to start broadcast", err);
        alert("Failed to start broadcast");
      } finally {
        setLoading(false);
      }
    } else {
      // End broadcast
      try {
        setLoading(true);
        if (liveStream?.id) {
          await supabase.from('live_streams').update({ is_active: false }).eq('id', liveStream.id);
          await loadLiveStream();
        }
      } catch (err) {
        console.error("Failed to end broadcast", err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !liveStream) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Live Settings...</div>;
  }

  const isActive = liveStream?.is_active;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto space-y-6">
      <div className={`p-6 md:p-8 rounded-2xl border transition-colors duration-500 ${isActive ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'bg-[#141414] border-white/10'}`}>
        
        <div className="flex items-center gap-3 mb-6">
          {isActive ? (
            <>
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
              <h2 className="text-xl font-black text-red-500 uppercase tracking-widest">Live Broadcast is Active</h2>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full bg-gray-600"></div>
              <h2 className="text-xl font-black text-white">Broadcast is Offline</h2>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400">Broadcast Title</label>
            <input 
              type="text" 
              placeholder="e.g. Sunday Morning Satsang" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              disabled={isActive}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400">YouTube Live URL</label>
            <input 
              type="text" 
              placeholder="Paste YouTube Live Link here..." 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              disabled={isActive}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none disabled:opacity-50"
            />
          </div>

          <div className="pt-4 flex justify-end">
            {isActive ? (
              <button 
                onClick={() => handleToggleLive(false)}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95 flex items-center gap-2"
              >
                <StopOutlined /> End Broadcast
              </button>
            ) : (
              <button 
                onClick={() => handleToggleLive(true)}
                disabled={loading}
                className="bg-[#FF9933] hover:bg-[#ff8800] text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(255,153,51,0.4)] transition-all active:scale-95 flex items-center gap-2"
              >
                <PlayCircleOutlined /> Start Broadcast to App
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-300">
          <strong>How it works:</strong> When you start a broadcast here, a highly visible "LIVE NOW" banner will instantly appear at the top of the Home screen for all users of the app. Tapping it will let them watch your live stream seamlessly inside the app.
        </p>
      </div>
    </div>
  );
}

export default AdminLiveTab;
