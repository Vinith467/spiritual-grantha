import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { CameraOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, VideoCameraOutlined, TableOutlined } from '@ant-design/icons';
import YouTubeHistoryTable from './YouTubeHistoryTable';

export default function AdminScreencastTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Global map of frames and last received times
  const [liveFrames, setLiveFrames] = useState({});
  const [lastFrameTimes, setLastFrameTimes] = useState({});
  const [liveMetadata, setLiveMetadata] = useState({});

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    const channel = supabase.channel('live-screencasts')
      .on('broadcast', { event: 'frame' }, (payload) => {
        if (payload.payload && payload.payload.session_id) {
          const { session_id, frame, video_title, video_duration, video_position } = payload.payload;
          setLiveFrames(prev => ({ ...prev, [session_id]: frame }));
          setLastFrameTimes(prev => ({ ...prev, [session_id]: new Date() }));
          if (video_title) {
            setLiveMetadata(prev => ({
              ...prev,
              [session_id]: { video_title, video_duration, video_position }
            }));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('earn_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Get recent 50 sessions
        
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('earn_sessions')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      fetchSessions();
      if (selectedSession && selectedSession.id === id) {
        setSelectedSession(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // 10 Hours limit = 36000 seconds
  const MAX_SESSION_SECONDS = 10 * 60 * 60;

  const calculateDuration = (session) => {
    const start = new Date(session.created_at).getTime();
    
    // If the DB explicitly has an end_time, always use it
    if (session.end_time) {
      return Math.floor((new Date(session.end_time).getTime() - start) / 1000);
    }
    
    // If the session is currently active, count up using current time
    if (isSessionActive(session.id)) {
      return Math.floor((new Date().getTime() - start) / 1000);
    }
    
    // If the session went OFFLINE while the dashboard was open, freeze at the last known frame time
    if (lastFrameTimes[session.id]) {
      return Math.floor((lastFrameTimes[session.id].getTime() - start) / 1000);
    }
    
    // Fallback if they were offline when dashboard opened and DB end_time is null
    // We freeze it at the start time or use whatever fallback we can, to avoid it counting up indefinitely.
    return 0; 
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Determine if a session is actively broadcasting right now (received frame in last 10 seconds)
  const isSessionActive = (sessionId) => {
    const lastTime = lastFrameTimes[sessionId];
    if (!lastTime) return false;
    return (new Date() - lastTime) < 10000;
  };

  // Keep track of the last saved title to prevent spamming Supabase
  const lastSavedTitleRef = useRef({});

  // Auto-save YouTube metadata to the database whenever it arrives via Realtime Broadcast
  // This ensures the dashboard always has the latest video title and position!
  useEffect(() => {
    const saveMetadataToDb = async () => {
      for (const [sessionId, meta] of Object.entries(liveMetadata)) {
        if (meta.video_title && meta.video_title.trim() !== '') {
          // Instead of caching in sessionStorage and never updating again, 
          // we update the database ONLY if the title actually changed.
          if (lastSavedTitleRef.current[sessionId] !== meta.video_title) {
            try {
              await supabase
                .from('earn_sessions')
                .update({ 
                  video_title: meta.video_title,
                  video_duration: meta.video_duration,
                  video_position: meta.video_position
                })
                .eq('id', sessionId);
                
              lastSavedTitleRef.current[sessionId] = meta.video_title;
            } catch (err) {
              console.error('Failed to sync metadata to DB:', err);
            }
          }
        }
      }
    };
    saveMetadataToDb();
  }, [liveMetadata]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading screencasts...</div>;
  }

  // Sort sessions: active first, then by date desc
  const sortedSessions = [...sessions].sort((a, b) => {
    const activeA = isSessionActive(a.id);
    const activeB = isSessionActive(b.id);
    if (activeA && !activeB) return -1;
    if (!activeA && activeB) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Deduplicate by devotee_email to show only the most recent session per user
  const uniqueSessions = sortedSessions.filter((session, index, self) => 
    index === self.findIndex((s) => s.devotee_email === session.devotee_email)
  );

  return (
    <div className="text-white min-h-screen">
      
      {/* Header section with Title and History Button */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <VideoCameraOutlined className="text-[#FF9933]" />
          Live Seva Monitor
        </h2>
        <button
          onClick={() => setShowHistory(true)}
          className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/50 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
        >
          <TableOutlined /> YouTube History
        </button>
      </div>

      {showHistory && <YouTubeHistoryTable onClose={() => setShowHistory(false)} />}

      {selectedSession ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-[#FF9933] to-yellow-500 transition-all duration-1000"
              style={{ width: `${Math.min((calculateDuration(selectedSession) / MAX_SESSION_SECONDS) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mb-6 pt-2">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {selectedSession.devotee_email}
                {isSessionActive(selectedSession.id) ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">LIVE</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">OFFLINE</span>
                )}
              </h3>
              <div className="text-sm text-gray-400 flex items-center gap-4 mt-2">
                <span><strong>Started:</strong> {new Date(selectedSession.created_at).toLocaleTimeString()}</span>
                {selectedSession.end_time && <span><strong>Ended:</strong> {new Date(selectedSession.end_time).toLocaleTimeString()}</span>}
                <span className="flex items-center gap-1 text-[#FF9933]">
                  <ClockCircleOutlined /> {formatDuration(calculateDuration(selectedSession))} / 10h limit
                </span>
              </div>
              
              {/* YouTube Metadata Display */}
              {liveMetadata[selectedSession.id] && (
                <div className="mt-4 bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    <span className="truncate max-w-md" title={liveMetadata[selectedSession.id].video_title}>
                      {liveMetadata[selectedSession.id].video_title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatDuration(liveMetadata[selectedSession.id].video_position || 0)}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500" 
                        style={{ width: `${Math.min(((liveMetadata[selectedSession.id].video_position || 0) / (liveMetadata[selectedSession.id].video_duration || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span>{formatDuration(liveMetadata[selectedSession.id].video_duration || 0)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to force pause ${selectedSession.devotee_email}? This will stop their live stream.`)) {
                    try {
                      await supabase.from('profiles').update({ force_paused: true }).eq('email', selectedSession.devotee_email);
                      alert("User forcefully paused. Their stream will stop shortly.");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to force pause user.");
                    }
                  }
                }}
                className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/50 px-4 py-2 rounded-lg font-bold uppercase transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Force Pause
              </button>
              <button 
                onClick={() => setSelectedSession(null)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                Back to Grid
              </button>
            </div>
          </div>

          <div className="flex justify-center mb-6 bg-black rounded-xl overflow-hidden border border-white/10 relative h-[60vh] shadow-2xl">
            {liveFrames[selectedSession.id] ? (
              <>
                <img src={liveFrames[selectedSession.id]} alt="Live feed" className="h-full object-contain" />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-2 text-xs text-white rounded-lg border border-white/10">
                  Last received: {lastFrameTimes[selectedSession.id]?.toLocaleTimeString()}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <VideoCameraOutlined className="text-4xl opacity-50 mb-2" />
                <p>No active feed available.</p>
                <p className="text-xs max-w-sm text-center">User might have closed the app or stopped earning.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {uniqueSessions.map(session => {
            const isActive = isSessionActive(session.id);
            const frame = liveFrames[session.id];
            
            return (
              <div 
                key={session.id} 
                onClick={() => setSelectedSession(session)}
                className={`group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-black border-[#FF9933]/50 hover:border-[#FF9933] hover:shadow-[0_0_15px_rgba(255,153,51,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Video Area */}
                <div className="aspect-video bg-black relative flex items-center justify-center">
                  {frame ? (
                    <img src={frame} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="feed" />
                  ) : (
                    <VideoCameraOutlined className="text-3xl text-white/10" />
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isActive ? (
                      <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse shadow-lg flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-gray-400 border border-white/10 backdrop-blur-md">
                        OFFLINE
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-3 bg-gradient-to-b from-transparent to-black/80 absolute bottom-0 w-full">
                  <div className="text-sm font-bold text-white truncate drop-shadow-md">
                    {session.devotee_email.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-300 drop-shadow-md flex justify-between items-center mt-1">
                    <span>{formatDuration(calculateDuration(session))}</span>
                    <span className="text-white/60">{new Date(session.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {uniqueSessions.length === 0 && (
            <div className="col-span-full p-12 text-center text-gray-500 bg-white/5 rounded-2xl border border-white/10">
              <VideoCameraOutlined className="text-4xl mb-4 opacity-50" />
              <p>No screencast sessions recorded yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
