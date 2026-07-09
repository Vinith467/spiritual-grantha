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

    return () => clearInterval(interval);
  }, [isSubscribed, profile?.email]);
}
