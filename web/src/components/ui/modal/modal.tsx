"use client";

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey, useBodyScrollLock, useIsMounted } from '@/hooks';
import styles from './modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  footer,
}: ModalProps) {
  const mounted = useIsMounted();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useBodyScrollLock(isOpen);
  useEscapeKey(onClose, isOpen && closeOnEscape);

  if (!isOpen || !mounted) return null;

  const sizeClass = styles[`size-${size}`] || styles['size-md'];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && closeOnEscape) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className={[styles['modal-container'], sizeClass, className].filter(Boolean).join(' ')}
      >
        {(title || showCloseButton) && (
          <div className={styles['modal-header']}>
            {title ? (
              typeof title === 'string' ? (
                <h2 id="modal-title" className={styles['modal-title']}>
                  {title}
                </h2>
              ) : (
                <div id="modal-title">{title}</div>
              )
            ) : (
              <div />
            )}

            {showCloseButton && (
              <button
                type="button"
                className={styles['close-button']}
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className={styles['modal-content']}>{children}</div>

        {footer && <div className={styles['modal-footer']}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ModalHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['modal-header'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function ModalTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={[styles['modal-title'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </h2>
  );
}

export function ModalContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['modal-content'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['modal-footer'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}
