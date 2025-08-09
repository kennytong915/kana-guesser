import { useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initializedRef = useRef(false);
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Write-through setter to avoid navigation race conditions
  const setAndPersist = (updater: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore write errors
      }
      return next;
    });
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  }, [key, value]);

  return [value, setAndPersist] as const;
} 