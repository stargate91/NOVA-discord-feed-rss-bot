import { useEffect } from 'react';

/**
 * Hook to trigger a callback when the Escape key is pressed.
 */
export function useEscapeKey(
  handler: (event: KeyboardEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handler, enabled]);
}
