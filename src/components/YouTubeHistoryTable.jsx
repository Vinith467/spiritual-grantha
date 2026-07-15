import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TableOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons';

export default function YouTubeHistoryTable({ onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('earn_sessions')
        .select('*')
        .not('video_title', 'is', null)
        .order('devotee_email', { ascending: true })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching youtube history:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (session) => {
    const start = new Date(session.created_at).getTime();
    const end = session.end_time ? new Date(session.end_time).getTime() : new Date().getTime();
    return Math.floor((end - start) / 1000); // in seconds
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Group sessions by devotee_email to show one person once, with all their videos
  const aggregatedSessions = (() => {
    const userGroups = {};
    sessions.forEach(session => {
      const email = session.devotee_email;
      if (!email) return;

      if (!userGroups[email]) {
        userGroups[email] = {
          id: session.id, // Just use the first session id as a key
          devotee_email: email,
          videos: new Set(),
          total_duration_seconds: 0,
          total_watched_seconds: 0,
          last_session_date: session.created_at
        };
      }
      
      const watched = calculateDuration(session);
      userGroups[email].total_watched_seconds += watched;
      
      if (session.video_title && session.video_title !== 'TEST_TITLE') {
        const durationStr = formatDuration(session.video_duration || 0);
        const videoStr = `${session.video_title} (${durationStr})`;
        userGroups[email].videos.add(videoStr);
        userGroups[email].total_duration_seconds += (session.video_duration || 0);
      }
      
      // Keep the most recent date
      if (new Date(session.created_at) > new Date(userGroups[email].last_session_date)) {
        userGroups[email].last_session_date = session.created_at;
      }
    });

    return Object.values(userGroups)
      .map(group => ({
        ...group,
        video_titles_array: Array.from(group.videos)
      }))
      .sort((a, b) => new Date(b.last_session_date) - new Date(a.last_session_date));
  })();

  const downloadCSV = () => {
    const headers = ['User Email', 'Video Titles', 'Total Video Length', 'Total Time Watched', 'Last Session Date'];
    const rows = aggregatedSessions.map(s => [
      s.devotee_email,
      `"${s.video_titles_array.join(' | ').replace(/"/g, '""')}"`,
      formatDuration(s.total_duration_seconds),
      formatDuration(s.total_watched_seconds),
      new Date(s.last_session_date).toLocaleString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(',')).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `YouTube_Watch_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/90 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-7xl h-[95vh] sm:h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/40 gap-4 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
            <TableOutlined className="text-[#FF9933]" />
            YouTube Watch History
          </h2>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={downloadCSV}
              className="flex-1 sm:flex-none justify-center bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white border border-green-600/50 px-3 sm:px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
            >
              <DownloadOutlined /> <span className="hidden xs:inline">Export</span> CSV
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none justify-center bg-white/5 hover:bg-white/20 px-3 sm:px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors flex items-center gap-2"
            >
              <CloseOutlined /> Close
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-2 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full text-white/50">
              Loading records...
            </div>
          ) : aggregatedSessions.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-white/50 gap-2">
              <TableOutlined className="text-4xl opacity-50" />
              <p>No YouTube watch history recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 h-full">
              <table className="w-full text-left text-sm text-gray-300 min-w-[1000px]">
                <thead className="bg-white/5 text-xs uppercase text-gray-400 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold w-[250px] max-w-[250px]">User</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold w-[400px]">Videos Watched</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold whitespace-nowrap">Total Video Length</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold whitespace-nowrap">Total Time Watched</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold whitespace-nowrap">Last Session Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {aggregatedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-white break-words max-w-[250px]">
                        {session.devotee_email}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-blue-400">
                        <div className="flex flex-col gap-1.5 break-words">
                          {session.video_titles_array.length === 0 && <span className="text-gray-500 italic">No videos recorded</span>}
                          {session.video_titles_array.map((title, i) => (
                            <div key={i} className="line-clamp-2" title={title}>
                              • {title}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        {formatDuration(session.total_duration_seconds)}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-[#FF9933] font-bold whitespace-nowrap">
                        {formatDuration(session.total_watched_seconds)}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs whitespace-nowrap">
                        <div>{new Date(session.last_session_date).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(session.last_session_date).toLocaleTimeString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
