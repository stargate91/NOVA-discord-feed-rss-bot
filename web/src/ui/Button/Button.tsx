import type { ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'discord' | 'danger' | 'outline' | 'ghost' | 'success' | 'glass' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  children?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    iconOnly ? styles.iconOnly : '',
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerSize = size === 'xs' || size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  const renderIcon = () => {
    if (loading && !iconOnly) {
      return (
        <span className={styles.spinner}>
          <Loader2 size={spinnerSize} />
        </span>
      );
    }
    if (icon) {
      return <span className={styles.icon}>{icon}</span>;
    }
    return null;
  };

  return (
    <button
      className={classes}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      {...rest}
    >
      {loading && iconOnly ? (
        <span className={styles.spinner}>
          <Loader2 size={spinnerSize} />
        </span>
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          {loading && loadingText ? (
            <span>{loadingText}</span>
          ) : (
            children && <span>{children}</span>
          )}
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </button>
  );
};
