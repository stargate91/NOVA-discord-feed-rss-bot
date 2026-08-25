"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useToastManager, ToastItem, UseToastManagerReturn } from '@/hooks/use_toast_manager';

export type { ToastItem };
export type ToastContextType = UseToastManagerReturn;

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toastManager = useToastManager();

  return (
    <ToastContext.Provider value={toastManager}>
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
