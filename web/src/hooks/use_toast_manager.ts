import { useState, useCallback } from 'react';
import { generateId } from '@/utils';
import { TOAST_CONFIG, ToastType } from '@/constants/toasts';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  title?: string;
}

export interface UseToastManagerReturn {
  toasts: ToastItem[];
  successOverlay: boolean;
  addToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
  showSuccess: () => void;
}

/**
 * Custom hook managing the toast notifications lifecycle and state.
 */
export function useToastManager(): UseToastManagerReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [successOverlay, setSuccessOverlay] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((
    message: string,
    type: ToastType = TOAST_CONFIG.DEFAULT_TYPE,
    title: string = ''
  ) => {
    const id = generateId('toast');
    const newToast: ToastItem = { id, message, type, title };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after configured delay
    setTimeout(() => {
      removeToast(id);
    }, TOAST_CONFIG.AUTO_REMOVE_DELAY_MS);
  }, [removeToast]);

  const showSuccess = useCallback(() => {
    setSuccessOverlay(true);
    setTimeout(() => setSuccessOverlay(false), TOAST_CONFIG.SUCCESS_OVERLAY_DURATION_MS);
  }, []);

  return {
    toasts,
    successOverlay,
    addToast,
    removeToast,
    showSuccess,
  };
}
