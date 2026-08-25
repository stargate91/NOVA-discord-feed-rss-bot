import { useEffect } from 'react';

/**
 * Hook to lock body scrolling when modal/drawer is open.
 */
export function useBodyScrollLock(locked: boolean = true) {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
}
