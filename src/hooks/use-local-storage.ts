'use client';

/**
 * useLocalStorage — generic key-value persistence via IndexedDB
 *
 * Used for settings, preferences, and any non-chat state.
 * Chat history now uses dedicated IndexedDB stores via useChatHistory.
 *
 * API-compatible with the old localStorage version.
 */

import { useState, useEffect, useCallback } from 'react';
import { idbGet, idbSet, isIDBAvailable } from '@/lib/indexed-db';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from IndexedDB on mount / key change
  useEffect(() => {
    if (!isIDBAvailable()) return;
    idbGet<T>(key).then((persisted) => {
      if (persisted !== undefined) setStoredValue(persisted);
    }).catch((err) => {
      console.warn(`[useLocalStorage] read error for "${key}":`, err);
    });
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        if (isIDBAvailable()) {
          idbSet(key, next).catch((err) => {
            console.warn(`[useLocalStorage] write error for "${key}":`, err);
          });
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}

