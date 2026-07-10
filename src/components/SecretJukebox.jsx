import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { supabase } from '../lib/supabase';

function SecretJukebox({ onClose }) {
  const [url, setUrl] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    loadPlaylist();
  }, []);

  const loadPlaylist = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_jukebox')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data) {
        setPlaylist(data);
      }
    } catch (err) {
      console.error('Error loading jukebox:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (input) => {
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const videoId = extractVideoId(url);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    try {
      // Create thumbnail from ID
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      const newTrack = {
        youtube_id: videoId,
        title: `Track ${playlist.length + 1}`,
        thumbnail_url: thumbnailUrl
      };

      const { data, error } = await supabase
        .from('admin_jukebox')
        .insert([newTrack])
        .select()
        .single();
        
      if (error) throw error;
      
      setPlaylist([...playlist, data]);
      setUrl('');
      
      if (currentTrackIndex === -1) {
        setCurrentTrackIndex(playlist.length);
      }
    } catch (err) {
      console.error('Error adding track:', err);
      alert('Failed to add track.');
    }
  };

  const deleteTrack = async (id) => {
    try {
      await supabase.from('admin_jukebox').delete().eq('id', id);
      setPlaylist(playlist.filter(t => t.id !== id));
      
      const index = playlist.findIndex(t => t.id === id);
      if (currentTrackIndex === index) {
        setCurrentTrackIndex(-1);
        setIsPlaying(false);
      } else if (currentTrackIndex > index) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      }
    } catch (err) {
      console.error('Error deleting track:', err);
    }
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    setCurrentTrackIndex(nextIndex);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    setCurrentTrackIndex(prevIndex);
  };

  const handleReady = (e) => {
    playerRef.current = e.target;
    e.target.playVideo();
    setIsPlaying(true);
  };

  if (minimized) {
    const activeTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;
    return (
      <div className="fixed bottom-20 right-4 md:right-8 z-[9999] bg-[#1a1a1a] border border-[#FF9933]/50 rounded-2xl shadow-2xl p-3 flex items-center gap-3 w-64 animate-in slide-in-from-bottom-5">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
           {activeTrack ? (
             <img src={activeTrack.thumbnail_url} className="w-full h-full object-cover opacity-80" />
           ) : (
             <div className="w-full h-full bg-white/10 flex items-center justify-center text-xs text-gray-500">None</div>
           )}
           {isPlaying && <div className="absolute inset-0 border-2 border-[#FF9933] rounded-lg animate-pulse" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate">{activeTrack ? 'Playing...' : 'Paused'}</p>
          <div className="flex gap-2 mt-1">
            <button onClick={playPrevious} className="text-gray-400 hover:text-white">⏮</button>
            <button onClick={() => {
              if (isPlaying) { playerRef.current?.pauseVideo(); setIsPlaying(false); }
              else { playerRef.current?.playVideo(); setIsPlaying(true); }
            }} className="text-[#FF9933]">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={playNext} className="text-gray-400 hover:text-white">⏭</button>
          </div>
        </div>
        <button onClick={() => setMinimized(false)} className="text-gray-400 hover:text-white p-1">⤢</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-black via-black to-[#1a1a1a]">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🎵 Secret <span className="text-[#FF9933]">Jukebox</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setMinimized(true)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-sm text-white transition-colors">
              Minimize
            </button>
            <button onClick={onClose} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-md text-sm transition-colors">
              Close
            </button>
          </div>
        </div>

        {/* Player Area (Hidden but active) */}
        <div className="hidden">
          {currentTrackIndex >= 0 && playlist[currentTrackIndex] && (
            <YouTube
              videoId={playlist[currentTrackIndex].youtube_id}
              opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
              onReady={handleReady}
              onEnd={playNext}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-6">
          {/* Active Track Viz */}
          <div className="md:w-1/2 flex flex-col items-center justify-center">
             {currentTrackIndex >= 0 && playlist[currentTrackIndex] ? (
               <div className="w-full aspect-video rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,153,51,0.2)] relative border border-white/10">
                 <img src={playlist[currentTrackIndex].thumbnail_url} className="w-full h-full object-cover animate-in fade-in duration-1000" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                   <div className="flex gap-4">
                     <button onClick={playPrevious} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all hover:scale-110">⏮</button>
                     <button onClick={() => {
                        if (isPlaying) { playerRef.current?.pauseVideo(); setIsPlaying(false); }
                        else { playerRef.current?.playVideo(); setIsPlaying(true); }
                     }} className="w-16 h-16 bg-[#FF9933] hover:bg-[#ff8800] rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,153,51,0.5)] transition-all hover:scale-110">
                       {isPlaying ? '⏸' : '▶'}
                     </button>
                     <button onClick={playNext} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all hover:scale-110">⏭</button>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="w-full aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                 No track playing
               </div>
             )}
          </div>

          {/* Playlist Manager */}
          <div className="md:w-1/2 flex flex-col">
            <form onSubmit={handleAddUrl} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Paste YouTube Link..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#FF9933]/50 outline-none text-white"
              />
              <button type="submit" className="bg-[#FF9933] text-black font-bold px-4 rounded-lg text-sm hover:opacity-90">
                Add
              </button>
            </form>

            <div className="flex-1 bg-black/50 border border-white/10 rounded-xl overflow-y-auto p-2 space-y-2 max-h-[300px]">
              {loading ? (
                <p className="text-center text-gray-500 text-sm mt-10 animate-pulse">Loading playlist...</p>
              ) : playlist.length === 0 ? (
                <p className="text-center text-gray-500 text-sm mt-10">Playlist is empty</p>
              ) : (
                playlist.map((track, i) => (
                  <div key={track.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${i === currentTrackIndex ? 'bg-[#FF9933]/20 border border-[#FF9933]/30' : 'hover:bg-white/5 border border-transparent'}`}>
                    <div className="w-12 h-12 rounded bg-black overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setCurrentTrackIndex(i)}>
                      <img src={track.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setCurrentTrackIndex(i)}>
                      <p className={`text-sm font-bold truncate ${i === currentTrackIndex ? 'text-[#FF9933]' : 'text-gray-300'}`}>
                        {i === currentTrackIndex && isPlaying ? '▶ ' : ''}{track.title}
                      </p>
                    </div>
                    <button onClick={() => deleteTrack(track.id)} className="text-gray-500 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecretJukebox;
