import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

// FOR TESTING: 30 seconds limit. Change to 36000 (10 hours) for production.
export const DAILY_LIMIT_SECONDS = 30;

export function useWatchLimit() {
  const { profile } = useAuth();
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [isForcePaused, setIsForcePaused] = useState(false);

  const getTodayKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      watchKey: `watch_time_${today}`,
      ackKey: `break_ack_${today}`
    };
  };

  useEffect(() => {
    const { watchKey, ackKey } = getTodayKey();
    const ack = localStorage.getItem(ackKey) === 'true';
    setHasAcknowledged(ack);
    
    const seconds = parseInt(localStorage.getItem(watchKey) || '0', 10);
    if (seconds >= DAILY_LIMIT_SECONDS && !ack) {
      setHasReachedLimit(true);
    }
  }, []);

  // Poll database for force_paused status
  useEffect(() => {
    if (!profile?.email || hasAcknowledged) return;

    const checkForcePause = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('force_paused')
          .eq('email', profile.email)
          .single();
        
        if (data && data.force_paused) {
          setIsForcePaused(true);
          setHasReachedLimit(true);
        }
      } catch (err) {
        console.error("Failed to check force_paused", err);
      }
    };

    // Check immediately, then every 5 seconds
    checkForcePause();
    const interval = setInterval(checkForcePause, 5000);
    return () => clearInterval(interval);
  }, [profile?.email, hasAcknowledged]);

  const addWatchTime = useCallback((seconds) => {
    if (hasAcknowledged || !profile) return;

    const { watchKey, ackKey } = getTodayKey();
    if (localStorage.getItem(ackKey) === 'true') {
      setHasAcknowledged(true);
      return;
    }

    const currentSeconds = parseInt(localStorage.getItem(watchKey) || '0', 10);
    const newSeconds = currentSeconds + seconds;
    localStorage.setItem(watchKey, newSeconds.toString());

    if (newSeconds >= DAILY_LIMIT_SECONDS && !hasReachedLimit) {
      setHasReachedLimit(true);
    }
  }, [hasAcknowledged, hasReachedLimit, profile]);

  const acknowledgeBreak = useCallback(async () => {
    const { ackKey } = getTodayKey();
    localStorage.setItem(ackKey, 'true');
    setHasAcknowledged(true);
    setHasReachedLimit(false);

    if (profile?.email) {
      const today = new Date().toISOString().split('T')[0];
      try {
        const updateData = { last_limit_reached_date: today };
        if (isForcePaused) {
          updateData.force_paused = false;
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('email', profile.email);
      } catch (err) {
        console.error("Failed to update limit_reached_date or force_paused", err);
      }
    }
    setIsForcePaused(false);
  }, [profile, isForcePaused]);

  return { addWatchTime, hasReachedLimit, acknowledgeBreak };
}
