import React from 'react';
import { X, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './alert.module.css';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
}

const DEFAULT_ICONS: Record<AlertVariant, React.ReactNode> = {
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <AlertCircle size={18} />,
  success: <CheckCircle size={18} />,
};

export function Alert({
  variant = 'info',
  icon,
  title,
  children,
  onClose,
  action,
  className,
  ...props
}: AlertProps) {
  const variantClass = styles[`alert-${variant}`] || styles['alert-info'];
  const displayIcon = icon !== undefined ? icon : DEFAULT_ICONS[variant];

  return (
    <div
      role="alert"
      className={[styles.alert, variantClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {displayIcon && <div className={styles['alert-icon']}>{displayIcon}</div>}
      <div className={styles['alert-body']}>
        {title && <div className={styles['alert-title']}>{title}</div>}
        {children && <div className={styles['alert-content']}>{children}</div>}
      </div>
      {action && <div className={styles['alert-action']}>{action}</div>}
      {onClose && (
        <button
          type="button"
          className={styles['alert-close-btn']}
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function AlertTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className={[styles['alert-title'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </h4>
  );
}

export function AlertDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={[styles['alert-content'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  );
}
