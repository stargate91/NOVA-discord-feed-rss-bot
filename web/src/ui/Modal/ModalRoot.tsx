import type { MouseEvent } from 'react';
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { ModalProps } from './types';
import { ModalContext } from './context';
import styles from './Modal.module.css';

export const ModalRoot: React.FC<ModalProps> = ({
  open,
  isOpen: legacyIsOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  portalTarget,
  children,
  className = '',
  id,
  ...rest
}) => {
  const visible = open ?? legacyIsOpen ?? false;
  const dialogRef = useFocusTrap<HTMLDivElement>(visible);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose?.();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (!visible) return;

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
      xl: styles.sizeXl,
      full: styles.sizeFull,
    }[size] || styles.sizeMd;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose?.();
    }
  };

  const hasMonolithicHeader = Boolean(title);

  const modalNode = (
    <ModalContext.Provider value={{ onClose }}>
      <div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
        <div
          ref={dialogRef}
          id={id}
          role="dialog"
          aria-modal="true"
          className={`${styles.dialog} ${sizeClass} ${className}`}
          {...rest}
        >
          {hasMonolithicHeader && (
            <div className={styles.header}>
              {typeof title === 'string' ? <h3 className={styles.title}>{title}</h3> : title}
              {showCloseButton && (
                <button
                  type="button"
                  aria-label="Close dialog"
                  className={styles.closeBtn}
                  onClick={onClose}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {hasMonolithicHeader ? <div className={styles.body}>{children}</div> : children}
        </div>
      </div>
    </ModalContext.Provider>
  );

  const target =
    portalTarget !== undefined
      ? portalTarget
      : typeof document !== 'undefined'
        ? document.body
        : null;

  if (!target) {
    return modalNode;
  }

  return createPortal(modalNode, target);
};
