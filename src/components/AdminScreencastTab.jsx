import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CameraOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export default function AdminScreencastTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [liveFrame, setLiveFrame] = useState(null);
  const [lastFrameTime, setLastFrameTime] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedSession) return;

    setLiveFrame(null);
    setLastFrameTime(null);

    const channel = supabase.channel('live-screencasts')
      .on('broadcast', { event: 'frame' }, (payload) => {
        if (payload.payload && payload.payload.session_id === selectedSession.id) {
          setLiveFrame(payload.payload.frame);
          setLastFrameTime(new Date());
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('earn_sessions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewSession = (session) => {
    setSelectedSession(session);
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

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading screencasts...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
        <CameraOutlined className="text-[#FF9933]" />
        Watch & Earn Verification
      </h2>

      {selectedSession ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Session Review</h3>
              <p className="text-gray-400 text-sm">{selectedSession.devotee_email}</p>
            </div>
            <button 
              onClick={() => setSelectedSession(null)}
              className="text-gray-400 hover:text-white"
            >
              Back to List
            </button>
          </div>

          <div className="flex justify-center mb-6 bg-black rounded-lg overflow-hidden border border-white/10 relative h-[60vh]">
            {liveFrame ? (
              <>
                <img src={liveFrame} alt="Live feed" className="h-full object-contain" />
                <div className="absolute top-4 right-4 bg-red-600 animate-pulse px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div> LIVE
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 p-2 text-xs text-white rounded">
                  Last received: {lastFrameTime?.toLocaleTimeString()}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-8 h-8 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin"></div>
                <p>Waiting for live feed from devotee...</p>
                <p className="text-xs max-w-sm text-center">Make sure they have the app open and are actively earning.</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => updateSessionStatus(selectedSession.id, 'approved')}
              className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-500/30"
            >
              <CheckCircleOutlined /> Approve
            </button>
            <button 
              onClick={() => updateSessionStatus(selectedSession.id, 'rejected')}
              className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-500/30"
            >
              <CloseCircleOutlined /> Reject
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/40 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Devotee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium">{s.devotee_email}</td>
                    <td className="px-4 py-3">{new Date(s.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        s.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        s.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => viewSession(s)}
                        className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/30"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No screencast sessions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
