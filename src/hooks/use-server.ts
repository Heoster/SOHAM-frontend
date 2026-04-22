/**
 * use-server.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React hook that wraps serverClient with loading/error state.
 *
 * Usage:
 *   const { call, loading, error } = useServer();
 *   const result = await call(() => serverClient.chat({ message }));
 */

'use client';

import { useState, useCallback } from 'react';

export function useServer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error, clearError: () => setError(null) };
}
