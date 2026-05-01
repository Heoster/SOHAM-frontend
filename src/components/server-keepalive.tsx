'use client';

import {useEffect, useRef} from 'react';
import {useAuth} from '@/hooks/use-auth';

const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1000;
const VISIBILITY_REFRESH_MS = 2 * 60 * 1000;

async function pingServer() {
  try {
    await fetch('/api/health?source=keepalive', {
      method: 'GET',
      cache: 'no-store',
      keepalive: true,
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.warn('[keepalive] health ping failed:', error);
  }
}

export function ServerKeepAlive() {
  const {user, loading} = useAuth();
  const lastPingRef = useRef(0);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const runPing = async () => {
      lastPingRef.current = Date.now();
      await pingServer();
    };

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastPingRef.current < VISIBILITY_REFRESH_MS) return;
      void runPing();
    };

    const handleOnline = () => {
      void runPing();
    };

    void runPing();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void runPing();
      }
    }, KEEPALIVE_INTERVAL_MS);

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loading, user]);

  return null;
}
