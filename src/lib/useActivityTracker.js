import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

export function useActivityTracker() {
  const { isSubscribed, profile } = useAuth();

  useEffect(() => {
    // Only track if logged in
    if (!isSubscribed || !profile?.email) return;

    const email = profile.email;
    const PING_INTERVAL = 30000; // 30 seconds

    const pingActivity = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Update online status in profiles
        await supabase
          .from('profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('email', email);

        // 2. Add time spent today
        // Fetch current session
        const { data: sessionData } = await supabase
          .from('user_sessions')
          .select('id, duration_seconds')
          .eq('user_email', email)
          .eq('session_date', today)
          .single();

        if (sessionData) {
          await supabase
            .from('user_sessions')
            .update({ 
              duration_seconds: sessionData.duration_seconds + 30,
              updated_at: new Date().toISOString()
            })
            .eq('id', sessionData.id);
        } else {
          await supabase
            .from('user_sessions')
            .insert([{ 
              user_email: email, 
              session_date: today, 
              duration_seconds: 30 
            }]);
        }
      } catch (err) {
        console.error('Failed to log activity ping:', err);
      }
    };

    // Run immediately on mount
    pingActivity();

    // Set interval to run every 30 seconds
    const interval = setInterval(pingActivity, PING_INTERVAL);

    // Immediately mark as offline when app closes or goes to background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Set last_active_at to 2 minutes ago to instantly appear offline
        const twoMinsAgo = new Date(Date.now() - 120000).toISOString();
        // Use sendBeacon for more reliable delivery during unload/hide if supported,
        // but since we are using Supabase client, we just do a fire-and-forget fetch/update
        supabase
          .from('profiles')
          .update({ last_active_at: twoMinsAgo })
          .eq('email', email)
          .then(() => console.log('Marked offline'))
          .catch(console.error);
      } else {
        // Ping immediately when coming back
        pingActivity();
      }
    };

    const handleBeforeUnload = () => {
      const twoMinsAgo = new Date(Date.now() - 120000).toISOString();
      supabase.from('profiles').update({ last_active_at: twoMinsAgo }).eq('email', email);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubscribed, profile?.email]);
}
