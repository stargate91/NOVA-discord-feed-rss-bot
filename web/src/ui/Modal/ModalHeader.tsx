import type { HTMLAttributes } from 'react';
import React from 'react';
import { X } from 'lucide-react';
import type { ModalHeaderProps } from './types';
import { useModal } from './context';
import styles from './Modal.module.css';

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
