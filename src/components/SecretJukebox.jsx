import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

function SecretJukebox({ onClose }) {
  const [url, setUrl] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [activePlaylistName, setActivePlaylistName] = useState('Default');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  const [isLooping, setIsLooping] = useState(false);

  // Derived active playlist
  const playlist = allTracks
    .filter(t => (t.playlist_name || 'Default') === activePlaylistName)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Compute all unique playlists
  const availablePlaylists = Array.from(new Set(allTracks.map(t => t.playlist_name || 'Default')));
  if (!availablePlaylists.includes('Default')) availablePlaylists.unshift('Default');
  if (!availablePlaylists.includes(activePlaylistName)) availablePlaylists.push(activePlaylistName);

  useEffect(() => {
    loadPlaylist();
  }, []);

  const loadPlaylist = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_jukebox')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data) {
        setAllTracks(data);
      }
    } catch (err) {
      console.error('Error loading jukebox:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (input) => {
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
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
        thumbnail_url: thumbnailUrl,
        sort_order: playlist.length,
        playlist_name: activePlaylistName
      };

      const { data, error } = await supabase
        .from('admin_jukebox')
        .insert([newTrack])
        .select()
        .single();
        
      if (error) throw error;
      
      setAllTracks([...allTracks, data]);
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
      const index = playlist.findIndex(t => t.id === id);
      
      setAllTracks(allTracks.filter(t => t.id !== id));
      
      if (currentTrackIndex === index) {
        setCurrentTrackIndex(-1);
        setIsPlaying(false);
      } else if (currentTrackIndex > index) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      }
      
      await supabase.from('admin_jukebox').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting track:', err);
    }
  };

  const handleReorder = async (newPlaylist) => {
    const activeTrackId = playlist[currentTrackIndex]?.id;
    
    const otherTracks = allTracks.filter(t => (t.playlist_name || 'Default') !== activePlaylistName);
    const updatedNewPlaylist = newPlaylist.map((t, i) => ({ ...t, sort_order: i }));
    setAllTracks([...otherTracks, ...updatedNewPlaylist]);
    
    if (activeTrackId) {
      const newIndex = updatedNewPlaylist.findIndex(t => t.id === activeTrackId);
      setCurrentTrackIndex(newIndex);
    }

    try {
      await Promise.all(
        updatedNewPlaylist.map((track) => 
          supabase.from('admin_jukebox').update({ sort_order: track.sort_order }).eq('id', track.id)
        )
      );
    } catch (err) {
      console.error('Error reordering:', err);
    }
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) {
      if (isLooping) {
        nextIndex = 0;
      } else {
        return; // Don't loop by default unless enabled
      }
    }
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
      <div className="fixed bottom-20 right-4 md:right-8 z-[9999] bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-3 flex items-center gap-3 w-64 animate-in slide-in-from-bottom-5 hover:bg-black/80 transition-colors">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0 relative shadow-inner">
           {activeTrack ? (
             <img src={activeTrack.thumbnail_url} className="w-full h-full object-cover opacity-90" alt="Thumbnail" />
           ) : (
             <div className="w-full h-full bg-white/5 flex items-center justify-center text-xs text-gray-500">None</div>
           )}
           {isPlaying && <div className="absolute inset-0 border-2 border-[#FF9933] rounded-xl animate-pulse" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate tracking-wide">{activeTrack ? activeTrack.title : 'Paused'}</p>
          <div className="flex gap-3 mt-1.5 items-center">
            <button onClick={playPrevious} className="text-gray-400 hover:text-white transition-colors">⏮</button>
            <button onClick={() => {
              if (isPlaying) { playerRef.current?.pauseVideo(); setIsPlaying(false); }
              else { playerRef.current?.playVideo(); setIsPlaying(true); }
            }} className="text-[#FF9933] hover:text-[#ffaa44] transition-colors scale-110">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">⏭</button>
            <button 
              onClick={() => setIsLooping(!isLooping)} 
              className={`text-xs ml-2 font-bold ${isLooping ? 'text-[#FF9933]' : 'text-gray-600 hover:text-gray-400'}`}
              title={isLooping ? 'Looping Playlist' : 'Loop Disabled'}
            >
              🔁
            </button>
          </div>
        </div>
        <button onClick={() => setMinimized(false)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">⤢</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden relative">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#FF9933]/20 blur-[100px] pointer-events-none rounded-full"></div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
              <span className="text-[#FF9933] drop-shadow-[0_0_10px_rgba(255,153,51,0.5)]">🎵</span> 
              Secret Jukebox
            </h2>
            <div className="flex md:hidden items-center gap-3">
              <button onClick={() => setMinimized(true)} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white font-semibold">Minimize</button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-full">✕</button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <select 
              value={activePlaylistName}
              onChange={(e) => {
                setActivePlaylistName(e.target.value);
                setCurrentTrackIndex(-1);
                setIsPlaying(false);
              }}
              className="bg-black/50 border border-[#FF9933]/30 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-[#FF9933] transition-colors min-w-[140px] cursor-pointer"
            >
              {availablePlaylists.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            
            <button 
              onClick={() => {
                const name = prompt("Enter new playlist name:");
                if (name && name.trim()) {
                  setActivePlaylistName(name.trim());
                  setCurrentTrackIndex(-1);
                  setIsPlaying(false);
                }
              }}
              className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-[#FF9933] font-semibold transition-colors flex items-center gap-2"
            >
              <span>+</span> New Playlist
            </button>
            
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
              <button onClick={() => setMinimized(true)} className="px-4 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-sm text-white font-semibold transition-all hover:scale-105 active:scale-95">
                Minimize
              </button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all hover:scale-105 active:scale-95">
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8 relative z-10">
          
          {/* Active Track Player (Visible) */}
          <div className="lg:w-7/12 flex flex-col">
             {currentTrackIndex >= 0 && playlist[currentTrackIndex] ? (
               <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] relative border border-white/10 bg-black group">
                 {/* 
                    By rendering the YouTube iframe visibly, we bypass mobile autoplay restrictions.
                    The user can see the beautiful video visuals and interact with it directly.
                 */}
                 <YouTube
                   videoId={playlist[currentTrackIndex].youtube_id}
                   opts={{ 
                     height: '100%', 
                     width: '100%', 
                     playerVars: { 
                       autoplay: 1,
                       controls: 1,
                       modestbranding: 1,
                       rel: 0
                     } 
                   }}
                   onReady={handleReady}
                   onEnd={playNext}
                   onPlay={() => setIsPlaying(true)}
                   onPause={() => setIsPlaying(false)}
                   className="absolute inset-0 w-full h-full"
                 />
               </div>
             ) : (
               <div className="w-full aspect-video rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-gray-500 shadow-inner">
                 <span className="text-4xl mb-3 opacity-50">🎧</span>
                 <span className="font-medium tracking-wide">Select a track to play</span>
               </div>
             )}

             {/* Currently Playing Info */}
             {currentTrackIndex >= 0 && playlist[currentTrackIndex] && (
               <div className="mt-6 px-2">
                 <div className="flex items-center gap-4">
                   <div className="flex-1">
                     <p className="text-[#FF9933] text-xs font-bold uppercase tracking-widest mb-1">Now Playing</p>
                     <h3 className="text-white text-xl font-bold line-clamp-1">{playlist[currentTrackIndex].title}</h3>
                   </div>
                   <button 
                     onClick={() => setIsLooping(!isLooping)} 
                     className={`text-sm flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                       isLooping 
                         ? 'bg-[#FF9933]/20 border-[#FF9933]/50 text-[#FF9933] shadow-[0_0_15px_rgba(255,153,51,0.2)]' 
                         : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/10'
                     }`}
                   >
                     🔁 {isLooping ? 'Looping' : 'Loop'}
                   </button>
                 </div>
               </div>
             )}
          </div>

          {/* Playlist Manager */}
          <div className="lg:w-5/12 flex flex-col h-[400px] lg:h-auto">
            <form onSubmit={handleAddUrl} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Paste YouTube Link..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 focus:bg-black/60 outline-none text-white transition-all shadow-inner placeholder:text-gray-600"
              />
              <button type="submit" className="bg-gradient-to-br from-[#FF9933] to-[#e68a2e] text-black font-black px-6 rounded-xl text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(255,153,51,0.3)] hover:shadow-[0_0_25px_rgba(255,153,51,0.5)] active:scale-95">
                Add
              </button>
            </form>

            <div className="flex-1 bg-black/20 border border-white/5 rounded-2xl overflow-y-auto p-2 space-y-2 relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                  <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Loading playlist...</p>
                </div>
              ) : playlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2">
                  <span className="text-3xl">👻</span>
                  <p className="text-sm font-medium">It's quiet in here...</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={playlist} onReorder={handleReorder} className="space-y-2 h-full overflow-y-auto overflow-x-hidden p-1">
                  <AnimatePresence initial={false}>
                    {playlist.map((track, i) => (
                      <Reorder.Item 
                        key={track.id} 
                        value={track} 
                        className="relative rounded-xl cursor-grab active:cursor-grabbing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      >
                        {/* The red background that shows when swiping left */}
                        <div className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end px-4 z-0">
                          <span className="text-white font-bold tracking-wider text-sm flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete
                          </span>
                        </div>
                        
                        {/* The Draggable Track Card */}
                        <motion.div 
                          drag="x"
                          dragConstraints={{ left: -100, right: 0 }}
                          dragElastic={{ left: 0.5, right: 0 }}
                          dragDirectionLock
                          onDragEnd={(e, info) => {
                            if (info.offset.x < -60) {
                              deleteTrack(track.id);
                            }
                          }}
                          className={`relative z-10 flex items-center gap-4 p-3 rounded-xl transition-all group bg-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.5)] border ${
                            i === currentTrackIndex 
                              ? 'border-[#FF9933]/50' 
                              : 'border-white/5 hover:bg-[#1a1a1a]'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center text-gray-500 cursor-grab px-1 touch-none">
                            <span className="text-xl">⣿</span>
                          </div>

                          <div 
                            className="w-16 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0 cursor-pointer relative shadow-md" 
                            onClick={() => setCurrentTrackIndex(i)}
                          >
                            <img src={track.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Thumbnail" />
                            {i === currentTrackIndex && isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-[#FF9933] text-xs animate-pulse">▶</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setCurrentTrackIndex(i)}>
                            <p className={`text-sm font-bold truncate transition-colors ${i === currentTrackIndex ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              {track.title}
                            </p>
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecretJukebox;
