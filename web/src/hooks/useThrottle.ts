import { useState, useEffect, useRef } from 'react';

/**
 * useThrottle hook limits the rate at which a value is updated.
 */
export const useThrottle = <T>(value: T, intervalMs: number = 300): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - lastExecuted.current;

    if (elapsed >= intervalMs) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, intervalMs - elapsed);

      return () => clearTimeout(timer);
    }
  }, [value, intervalMs]);

  return throttledValue;
};
