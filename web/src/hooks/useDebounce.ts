import { useState, useEffect } from 'react';

/**
 * useDebounce hook delays updating the returned value until `delayMs` has passed
 * without new value changes.
 *
 * @param value The value to debounce
 * @param delayMs Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delayMs: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
};
