import type { HTMLAttributes, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Drawer.module.css';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  size?: DrawerSize;
  title?: ReactNode;
  description?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  position = 'right',
  size = 'md',
  title,
  description,
  headerActions,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = '',
  id,
  ...rest
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  const positionClass = {
    right: styles.posRight,
    left: styles.posLeft,
    top: styles.posTop,
    bottom: styles.posBottom,
  }[position] || styles.posRight;

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
    full: styles.sizeFull,
  }[size] || styles.sizeMd;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        className={`${styles.drawer} ${positionClass} ${sizeClass} ${className}`}
        {...rest}
      >
        {(title || description || showCloseButton || headerActions) && (
          <div className={styles.header}>
            <div className={styles.titleArea}>
              {title && (
                typeof title === 'string' ? (
                  <h3 className={styles.title}>{title}</h3>
                ) : (
                  title
                )
              )}
              {description && (
                typeof description === 'string' ? (
                  <p className={styles.description}>{description}</p>
                ) : (
                  description
                )
              )}
            </div>

            <div className={styles.headerActions}>
              {headerActions}
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );
};
