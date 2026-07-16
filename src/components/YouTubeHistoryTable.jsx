import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TableOutlined, CloseOutlined, DownloadOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';

export default function YouTubeHistoryTable({ onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('today'); // 'today', 'yesterday', 'custom', 'all'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    fetchHistory();
  }, [filterType, customStart, customEnd]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('video_views')
        .select('*')
        .order('viewed_at', { ascending: false });

      const now = new Date();
      
      if (filterType === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('viewed_at', startOfToday);
      } else if (filterType === 'yesterday') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        
        query = query
          .gte('viewed_at', startOfYesterday.toISOString())
          .lt('viewed_at', startOfToday.toISOString());
      } else if (filterType === 'custom' && customStart && customEnd) {
        // Assume customStart and customEnd are YYYY-MM-DD strings from input type="date"
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        query = query
          .gte('viewed_at', start.toISOString())
          .lte('viewed_at', end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching youtube history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Group sessions by user_email
  const aggregatedSessions = (() => {
    const userGroups = {};
    sessions.forEach(session => {
      const email = session.user_email;
      if (!email) return;

      if (!userGroups[email]) {
        userGroups[email] = {
          user_email: email,
          total_watched_seconds: 0,
          videos: [],
          last_session_date: session.viewed_at
        };
      }
      
      const watched = session.duration_seconds || 0;
      userGroups[email].total_watched_seconds += watched;
      
      if (session.video_title) {
        userGroups[email].videos.push({
          title: session.video_title,
          duration: watched,
          date: session.viewed_at
        });
      }
      
      if (new Date(session.viewed_at) > new Date(userGroups[email].last_session_date)) {
        userGroups[email].last_session_date = session.viewed_at;
      }
    });

    return Object.values(userGroups)
      .sort((a, b) => new Date(b.last_session_date) - new Date(a.last_session_date));
  })();

  const toggleUser = (email) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) newSet.delete(email);
      else newSet.add(email);
      return newSet;
    });
  };

  const downloadCSV = () => {
    const headers = ['User Email', 'Video Title', 'Time Watched', 'Date Viewed'];
    const rows = [];
    
    aggregatedSessions.forEach(user => {
      user.videos.forEach(vid => {
        rows.push([
          user.user_email,
          `"${vid.title.replace(/"/g, '""')}"`,
          formatDuration(vid.duration),
          new Date(vid.date).toLocaleString()
        ]);
      });
    });
    
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
          <div className="flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
              <TableOutlined className="text-[#FF9933]" />
              YouTube Watch History
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-sm rounded-lg focus:ring-[#FF9933] focus:border-[#FF9933] block p-2 outline-none"
              >
                <option value="today" className="bg-[#141414]">Today</option>
                <option value="yesterday" className="bg-[#141414]">Yesterday</option>
                <option value="custom" className="bg-[#141414]">Custom Date</option>
                <option value="all" className="bg-[#141414]">All Time</option>
              </select>

              {filterType === 'custom' && (
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white text-sm rounded-lg block p-2 outline-none [color-scheme:dark]"
                  />
                  <span className="text-white/50 text-sm">to</span>
                  <input 
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white text-sm rounded-lg block p-2 outline-none [color-scheme:dark]"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto mt-4 sm:mt-0">
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
              <p>No YouTube watch history recorded for this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 h-full">
              <table className="w-full text-left text-sm text-gray-300 min-w-[800px]">
                <thead className="bg-white/5 text-xs uppercase text-gray-400 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold w-12"></th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold">User Email</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold">Total Time Watched</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {aggregatedSessions.map((user) => {
                    const isExpanded = expandedUsers.has(user.user_email);
                    return (
                      <React.Fragment key={user.user_email}>
                        <tr 
                          onClick={() => toggleUser(user.user_email)}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-white/50">
                            {isExpanded ? <DownOutlined /> : <RightOutlined />}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-white break-words">
                            {user.user_email}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 text-[#FF9933] font-bold whitespace-nowrap">
                            {formatDuration(user.total_watched_seconds)}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs whitespace-nowrap">
                            <div>{new Date(user.last_session_date).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(user.last_session_date).toLocaleTimeString()}</div>
                          </td>
                        </tr>
                        {isExpanded && user.videos.length > 0 && (
                          <tr className="bg-black/40">
                            <td colSpan={4} className="p-0">
                              <div className="p-4 pl-16 border-l-4 border-[#FF9933]/50">
                                <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Individual Videos Watched</h4>
                                <div className="space-y-3">
                                  {user.videos.map((vid, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/5 rounded-lg">
                                      <div className="flex-1 min-w-0 pr-4">
                                        <div className="font-medium text-white truncate" title={vid.title}>
                                          {vid.title}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {new Date(vid.date).toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="text-blue-400 font-mono text-sm whitespace-nowrap bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20">
                                        {formatDuration(vid.duration)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
