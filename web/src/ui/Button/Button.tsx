import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'discord'
  | 'danger'
  | 'outline'
  | 'ghost'
  | 'success'
  | 'glass'
  | 'link'
  | 'soft'
  | 'gradient'
  | 'danger-outline'
  | 'danger-ghost';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  as?: ElementType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  children?: ReactNode;
  href?: string;
  to?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  as: Component = 'button',
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  leftIcon,
  rightIcon,
  iconOnly = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const variantClassMap: Record<ButtonVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
    discord: styles.discord,
    danger: styles.danger,
    outline: styles.outline,
    ghost: styles.ghost,
    success: styles.success,
    glass: styles.glass,
    link: styles.link,
    soft: styles.soft,
    gradient: styles.gradient,
    'danger-outline': styles.dangerOutline,
    'danger-ghost': styles.dangerGhost,
  };

  const classes = [
    styles.btn,
    variantClassMap[variant] || styles.secondary,
    styles[size],
    iconOnly ? styles.iconOnly : '',
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerSize = size === 'xs' || size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  const effectiveLeftIcon = leftIcon || (iconPosition === 'left' ? icon : null);
  const effectiveRightIcon = rightIcon || (iconPosition === 'right' ? icon : null);

  const isNativeButton = Component === 'button';

  return (
    <Component
      className={classes}
      disabled={isNativeButton ? isDisabled : undefined}
      aria-disabled={!isNativeButton && isDisabled ? true : undefined}
      aria-busy={loading ? 'true' : undefined}
      {...(isNativeButton ? { type: rest.type || 'button' } : {})}
      {...rest}
    >
      {loading && iconOnly ? (
        <span className={styles.spinner}>
          <Loader2 size={spinnerSize} />
        </span>
      ) : (
        <>
          {loading && !iconOnly && (
            <span className={styles.spinner}>
              <Loader2 size={spinnerSize} />
            </span>
          )}
          {!loading && effectiveLeftIcon && (
            <span className={styles.icon}>{effectiveLeftIcon}</span>
          )}
          {loading && loadingText ? (
            <span>{loadingText}</span>
          ) : (
            children && <span>{children}</span>
          )}
          {!loading && effectiveRightIcon && (
            <span className={styles.icon}>{effectiveRightIcon}</span>
          )}
        </>
      )}
    </Component>
  );
};
