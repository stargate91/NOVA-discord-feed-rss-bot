import type { ReactNode } from 'react';
import React, { useState, useCallback, useMemo } from 'react';
import type { ToastItem as ToastItemType, ToastType, ToastContextValue } from './types';
import { ToastContext } from './context';
import { ToastItem } from './ToastItem';
import styles from './Toast.module.css';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItemType[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string, title?: string, duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItemType = { id, type, message, title, duration };
      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 visible
    },
    []
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      show('success', message, title, duration);
    },
    [show]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      show('error', message, title, duration);
    },
    [show]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      show('warning', message, title, duration);
    },
    [show]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      show('info', message, title, duration);
    },
    [show]
  );

  const value: ToastContextValue = useMemo(
    () => ({
      toasts,
      show,
      success,
      error,
      warning,
      info,
      dismiss,
    }),
    [toasts, show, success, error, warning, info, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className={styles.container}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
