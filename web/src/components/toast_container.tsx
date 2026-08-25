"use client";

import React from 'react';
import { useToast, ToastItem as ToastData } from '@/context/toast_context';
import { X } from 'lucide-react';
import { renderToastIcon, getToastIconClass } from '@/utils';
import styles from './toast_container.module.css';

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const iconClass = getToastIconClass(toast.type, styles);

  return (
    <div className={styles["toast-card"]}>
      <div className={styles["toast-body"]}>
        <div className={styles["toast-icon-wrap"]}>
          {renderToastIcon(toast.type, iconClass)}
        </div>
        <div className={styles["toast-content"]}>
          {toast.title && <div className={styles["toast-title"]}>{toast.title}</div>}
          <div className={styles["toast-message"]}>{toast.message}</div>
        </div>
      </div>
      <button 
        type="button"
        className={styles["toast-close-btn"]}
        onClick={() => onRemove(toast.id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles["toast-container"]}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
