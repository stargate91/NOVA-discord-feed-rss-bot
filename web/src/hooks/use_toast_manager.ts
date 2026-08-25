import { useState, useCallback } from 'react';
import { generateId } from '@/utils';
import { TOAST_CONFIG, ToastType } from '@/constants/toasts';
import { extractErrorMessage } from '@/utils/toast';

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
  error: (err: unknown, fallbackMessage?: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
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

  const error = useCallback((
    err: unknown,
    fallbackMessage = 'An unexpected error occurred',
    title = ''
  ) => {
    const message = extractErrorMessage(err, fallbackMessage);
    addToast(message, 'error', title);
  }, [addToast]);

  const success = useCallback((message: string, title = '') => {
    addToast(message, 'success', title);
  }, [addToast]);

  const info = useCallback((message: string, title = '') => {
    addToast(message, 'info', title);
  }, [addToast]);

  const warning = useCallback((message: string, title = '') => {
    addToast(message, 'warning', title);
  }, [addToast]);

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
    error,
    success,
    info,
    warning,
  };
}
