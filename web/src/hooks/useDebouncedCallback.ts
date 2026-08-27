import { useRef, useEffect, useCallback } from 'react';

/**
 * useDebouncedCallback hook returns a memoized function that delays invoking `callback`
 * until after `delayMs` milliseconds have elapsed since the last time it was invoked.
 */
export const useDebouncedCallback = <TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number = 300
): ((...args: TArgs) => void) => {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: TArgs) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs]
  );
};
