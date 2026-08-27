import { useState, useEffect, useCallback } from 'react';

/**
 * Type-safe useLocalStorage hook with cross-tab event synchronization.
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === 'undefined') return;

      try {
        setStoredValue((current) => {
          const valueToStore = value instanceof Function ? value(current) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event('local-storage-sync'));
          return valueToStore;
        });
      } catch {
        // Ignore quota write errors
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage-sync'));
    } catch {
      // Ignore errors
    }
  }, [key, initialValue]);

  // Sync across tabs & local-storage-sync events
  useEffect(() => {
    const handleSync = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('local-storage-sync', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('local-storage-sync', handleSync);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
};
