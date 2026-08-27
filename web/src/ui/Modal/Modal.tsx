import type { HTMLAttributes, ReactNode, MouseEvent } from 'react';
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalContextValue {
  onClose?: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const useModal = () => useContext(ModalContext);

/* --------------------------------------------------------------------------
   Root Modal Component
   -------------------------------------------------------------------------- */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export const ModalRoot: React.FC<ModalProps> = ({
  open,
  isOpen: legacyIsOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
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

  return (
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
};

/* --------------------------------------------------------------------------
   Modal Compound Subcomponents
   -------------------------------------------------------------------------- */
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  children: ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  showCloseButton = true,
  children,
  className = '',
  ...rest
}) => {
  const modal = useModal();

  return (
    <div className={`${styles.header} ${className}`} {...rest}>
      {children}
      {showCloseButton && (
        <button
          type="button"
          aria-label="Close dialog"
          className={styles.closeBtn}
          onClick={modal?.onClose}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export const ModalTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <h3 className={`${styles.title} ${className}`} {...rest}>
    {children}
  </h3>
);

export const ModalBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.body} ${className}`} {...rest}>
    {children}
  </div>
);

export const ModalFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.footer} ${className}`} {...rest}>
    {children}
  </div>
);

/* --------------------------------------------------------------------------
   Compound Export
   -------------------------------------------------------------------------- */
interface ModalCompound extends React.FC<ModalProps> {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
}

export const Modal = ModalRoot as ModalCompound;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
