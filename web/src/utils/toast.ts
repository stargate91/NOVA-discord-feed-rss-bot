import React from 'react';
import { CheckCircle, AlertCircle, Info, LucideIcon } from 'lucide-react';
import { ToastType } from '@/constants/toasts';

/**
 * Returns the Lucide icon component for a given toast type.
 */
export function getToastIcon(type?: ToastType): LucideIcon {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'error':
    case 'warning':
      return AlertCircle;
    default:
      return Info;
  }
}

/**
 * Renders the Lucide icon element for a given toast type.
 */
export function renderToastIcon(type?: ToastType, className?: string, size = 20): React.ReactNode {
  return React.createElement(getToastIcon(type), { className, size });
}

/**
 * Returns the CSS module class name for a given toast type.
 */
export function getToastIconClass(type?: ToastType, styles: Record<string, string> = {}): string {
  switch (type) {
    case 'success':
      return styles['toast-icon-success'] || '';
    case 'error':
      return styles['toast-icon-error'] || '';
    case 'warning':
      return styles['toast-icon-warning'] || '';
    default:
      return styles['toast-icon-info'] || '';
  }
}

/**
 * Safely extracts a displayable error message from unknown error objects.
 */
export function extractErrorMessage(
  err: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  if (!err) return defaultMessage;
  if (typeof err === 'string' && err.trim()) return err;
  if (typeof err === 'object') {
    const e = err as Record<string, any>;
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
    if (typeof e.error === 'string' && e.error.trim()) return e.error;
    if (typeof e.statusText === 'string' && e.statusText.trim()) return e.statusText;
  }
  return defaultMessage;
}

