import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import type { ConfirmOptions } from './types';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { Button } from '../../../ui';
import styles from './Modal.module.css';

interface ConfirmDialogProps extends ConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title = 'Please Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'primary':
      default:
        return <HelpCircle size={18} />;
    }
  };

  const getIconWrapperClass = () => {
    switch (variant) {
      case 'danger':
        return styles.iconWrapper;
      case 'warning':
        return `${styles.iconWrapper} ${styles.iconWrapperWarning}`;
      case 'primary':
      default:
        return `${styles.iconWrapper} ${styles.iconWrapperPrimary}`;
    }
  };

  const getModalClass = () => {
    switch (variant) {
      case 'danger':
        return `${styles.modal} ${styles.modalDanger}`;
      case 'warning':
        return `${styles.modal} ${styles.modalWarning}`;
      case 'primary':
      default:
        return styles.modal;
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div ref={dialogRef} className={getModalClass()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={getIconWrapperClass()}>{getIcon()}</div>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>{message}</div>

        <div className={styles.footer}>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
