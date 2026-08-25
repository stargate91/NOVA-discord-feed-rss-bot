"use client";

import React, { forwardRef } from 'react';
import styles from './icon-button.module.css';
import { Spinner } from '../spinner';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  rounded?: boolean;
  isLoading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      size = 'md',
      variant = 'ghost',
      rounded = false,
      isLoading = false,
      disabled,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClass = styles[`size-${size}`] || styles['size-md'];
    const variantClass = styles[`variant-${variant}`] || styles['variant-ghost'];
    const roundedClass = rounded ? styles.rounded : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={[
          styles['icon-btn'],
          sizeClass,
          variantClass,
          roundedClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {isLoading ? <Spinner size={size === 'lg' ? 'md' : 'xs'} /> : icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
