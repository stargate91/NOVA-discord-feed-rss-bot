import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseTooltipOptions {
  delayMs?: number;
}

export function useTooltip(options?: UseTooltipOptions) {
  const delayMs = options?.delayMs ?? 200;
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  }, [delayMs, clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    setIsVisible(false);
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isVisible,
    show,
    hide,
    triggerProps: {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
    },
  };
}
