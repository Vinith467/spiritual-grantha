import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';

const ScreenCapture = registerPlugin('ScreenCapture');

export default function EarnTasks() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem('profileEmail');

  useEffect(() => {
    // We no longer need to listen to frames in React!
    // The native Android service will now upload frames DIRECTLY to Supabase Realtime
    // via HTTP POST, which perfectly handles the app being minimized or screen locked!
  }, [isRecording, session, userEmail]);

  const startEarnSession = async () => {
    try {
      setError(null);
      
      // 1. Get current user from localStorage since native login bypasses Supabase Auth
      const userEmail = localStorage.getItem('profileEmail');
      if (!userEmail) throw new Error("Must be logged in to earn.");

      // Check Notification Permission for Native Android
      if (Capacitor.isNativePlatform()) {
        const permResult = await ScreenCapture.checkNotificationPermission();
        if (!permResult.hasPermission) {
          alert("To capture YouTube video titles and durations for your Live Seva, we need 'Notification Access' permission.\n\nPlease enable it for this app in the settings screen that will open now, then come back and press Start again.");
          await ScreenCapture.requestNotificationPermission();
          return;
        }
      }

      // 2. Create session in Supabase
      const { data: sessionData, error: sessionError } = await supabase
        .from('earn_sessions')
        .insert({
          devotee_email: userEmail,
          video_id: 'live_stream',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // 3. Start Native Screen Recording
      if (Capacitor.isNativePlatform()) {
        await ScreenCapture.startRecording({
          SESSION_ID: sessionData.id,
          EMAIL: userEmail,
          SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
          SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
        });
      }

      setIsRecording(true);
      
      // 4. Open YouTube App (or guide user to open it)
      alert("Screen recording started! Please minimize this app and open YouTube to watch the assigned video. DO NOT close this app.");

    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsRecording(false);
    }
  };

  const stopEarnSession = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await ScreenCapture.stopRecording();
      }
      
      if (session) {
        const endTime = new Date();
        const startTime = new Date(session.created_at);
        // Calculate duration in seconds
        const durationSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000));

        // 1. Update session end time
        await supabase
          .from('earn_sessions')
          .update({ end_time: endTime.toISOString() })
          .eq('id', session.id);

        // Note: We no longer insert into video_views because Account.jsx and Admin.jsx 
        // now directly sum the durations of all earn_sessions dynamically!
      }
      
      setIsRecording(false);
      setSession(null);
      alert("Seva stream stopped. Your progress has been added to your Account Journey!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4 mt-6">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/account')}
        className="flex items-center gap-2 text-gray-400 mb-6 active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        <span className="font-bold">Back to Account</span>
      </button>

      <div className="bg-surface rounded-xl p-6 shadow-lg border border-white/5">
        <h2 className="text-2xl font-bold mb-4 text-primary">Live Seva Stream</h2>
        
        <div className="bg-black/30 p-4 rounded-lg mb-6 text-sm text-gray-300">
          <p className="mb-2"><strong>Instructions:</strong></p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click "Start Earning". Android will ask for permission to record your screen.</li>
            <li>Once accepted, minimize this app and open the YouTube App.</li>
            <li>Watch the assigned video. Your screen will be periodically captured to verify watch time.</li>
            <li>When finished, return here and click "Stop Earning".</li>
          </ol>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isRecording ? (
          <button 
            onClick={startEarnSession}
            className="w-full bg-primary text-background py-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            Start Earning
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-3 rounded-lg animate-pulse">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              Recording in progress...
            </div>
            
            <button 
              onClick={stopEarnSession}
              className="w-full bg-surface-light border border-red-500/30 text-red-400 py-3 rounded-lg font-bold"
            >
              Stop Earning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
