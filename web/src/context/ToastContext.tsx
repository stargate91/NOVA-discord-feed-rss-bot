"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
}

interface ToastContextType {
  addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;
  showSuccess: () => void;
  toasts: ToastItem[];
  successOverlay: boolean;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [successOverlay, setSuccessOverlay] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', title: string = '') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, message, type, title };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const showSuccess = useCallback(() => {
    setSuccessOverlay(true);
    setTimeout(() => setSuccessOverlay(false), 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, toasts, successOverlay }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
