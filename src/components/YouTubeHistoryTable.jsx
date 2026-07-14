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

  const downloadCSV = () => {
    const headers = ['User Email', 'Video Title', 'Video Duration', 'Watched For', 'Date Started', 'Date Ended'];
    const rows = sessions.map(s => [
      s.devotee_email,
      `"${(s.video_title || '').replace(/"/g, '""')}"`,
      formatDuration(s.video_duration || 0),
      formatDuration(calculateDuration(s)),
      new Date(s.created_at).toLocaleString(),
      s.end_time ? new Date(s.end_time).toLocaleString() : 'Ongoing'
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-7xl h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <TableOutlined className="text-[#FF9933]" />
            YouTube Watch History
          </h2>
          <div className="flex gap-4">
            <button
              onClick={downloadCSV}
              className="bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white border border-green-600/50 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
            >
              <DownloadOutlined /> Export CSV
            </button>
            <button
              onClick={onClose}
              className="bg-white/5 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <CloseOutlined /> Close
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full text-white/50">
              Loading records...
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-white/50 gap-2">
              <TableOutlined className="text-4xl opacity-50" />
              <p>No YouTube watch history recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-xs uppercase text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold w-1/3">Video Title</th>
                    <th className="px-6 py-4 font-bold">Total Video Length</th>
                    <th className="px-6 py-4 font-bold">Time Watched</th>
                    <th className="px-6 py-4 font-bold">Session Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {session.devotee_email}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-400">
                        {session.video_title}
                      </td>
                      <td className="px-6 py-4">
                        {formatDuration(session.video_duration || 0)}
                      </td>
                      <td className="px-6 py-4 text-[#FF9933] font-bold">
                        {formatDuration(calculateDuration(session))}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div>{new Date(session.created_at).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(session.created_at).toLocaleTimeString()}</div>
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
