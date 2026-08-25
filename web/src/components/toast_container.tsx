"use client";

import React from 'react';
import { useToast, ToastItem as ToastData } from '@/context/toast_context';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import styles from './toast_container.module.css';

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className={styles["toast-icon-success"]} size={20} />;
      case 'error': return <AlertCircle className={styles["toast-icon-error"]} size={20} />;
      case 'warning': return <AlertCircle className={styles["toast-icon-warning"]} size={20} />;
      default: return <Info className={styles["toast-icon-info"]} size={20} />;
    }
  };

  return (
    <div className={styles["toast-card"]}>
      <div className={styles["toast-body"]}>
        <div className={styles["toast-icon-wrap"]}>{getIcon()}</div>
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
