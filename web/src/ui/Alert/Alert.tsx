import type { HTMLAttributes, ReactNode } from 'react';
import React, { useState } from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from 'lucide-react';
import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  description,
  icon,
  action,
  closable = false,
  onClose,
  children,
  className = '',
  id,
  ...rest
}) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  const defaultIcon = {
    info: <Info size={18} />,
    success: <CheckCircle2 size={18} />,
    warning: <AlertTriangle size={18} />,
    danger: <AlertOctagon size={18} />,
  }[variant];

  const variantClass =
    {
      info: styles.variantInfo,
      success: styles.variantSuccess,
      warning: styles.variantWarning,
      danger: styles.variantDanger,
    }[variant] || styles.variantInfo;

  const alertIcon = icon !== undefined ? icon : defaultIcon;

  return (
    <div id={id} role="alert" className={`${styles.alert} ${variantClass} ${className}`} {...rest}>
      {alertIcon && <span className={styles.icon}>{alertIcon}</span>}

      <div className={styles.content}>
        {title && (typeof title === 'string' ? <h4 className={styles.title}>{title}</h4> : title)}
        {description &&
          (typeof description === 'string' ? (
            <p className={styles.description}>{description}</p>
          ) : (
            description
          ))}
        {children}
        {action && <div className={styles.action}>{action}</div>}
      </div>

      {closable && (
        <button
          type="button"
          aria-label="Dismiss alert"
          className={styles.closeBtn}
          onClick={handleClose}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
