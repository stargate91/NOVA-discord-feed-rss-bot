"use client";

import React, { forwardRef } from 'react';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'neon' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantClass = styles[`btn-${variant}`] || styles['btn-primary'];
    const sizeClass = styles[`btn-${size}`] || styles['btn-md'];
    const widthClass = fullWidth ? styles['btn-full-width'] : '';

    const combinedClassName = [
      styles.btn,
      variantClass,
      sizeClass,
      widthClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClassName}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className={styles['btn-spinner']} aria-hidden="true" />
        ) : (
          leftIcon && <span className={styles['btn-icon']}>{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className={styles['btn-icon']}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
