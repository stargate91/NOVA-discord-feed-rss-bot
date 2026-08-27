import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import { X } from 'lucide-react';
import styles from './FloatingBar.module.css';

export type FloatingBarPosition = 'bottom' | 'top';
export type FloatingBarVariant = 'default' | 'glass' | 'danger' | 'info';

export interface FloatingBarProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  visible?: boolean;
  position?: FloatingBarPosition;
  variant?: FloatingBarVariant;
  message?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const FloatingBar: React.FC<FloatingBarProps> = ({
  open = true,
  visible,
  position = 'bottom',
  variant = 'glass',
  message,
  actions,
  onClose,
  children,
  className = '',
  id,
  ...rest
}) => {
  const isVisible = visible !== undefined ? visible : open;

  if (!isVisible) return null;

  const positionClass = position === 'top' ? styles.posTop : styles.posBottom;

  const variantClass = {
    default: styles.variantDefault,
    glass: styles.variantGlass,
    danger: styles.variantDanger,
    info: styles.variantInfo,
  }[variant] || styles.variantGlass;

  const content = children ?? message;

  return (
    <div
      id={id}
      role="region"
      aria-label="Floating actions"
      className={`${styles.bar} ${positionClass} ${variantClass} ${className}`}
      {...rest}
    >
      {content && <div className={styles.content}>{content}</div>}

      {(actions || onClose) && (
        <div className={styles.actions}>
          {actions}
          {onClose && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Dismiss action bar"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
