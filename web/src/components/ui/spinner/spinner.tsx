import React from 'react';
import styles from './spinner.module.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'white' | 'muted';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
}

export function Spinner({
  size = 'md',
  variant = 'primary',
  label = 'Loading...',
  className,
  ...props
}: SpinnerProps) {
  const sizeClass = styles[`size-${size}`] || styles['size-md'];
  const variantClass = styles[`variant-${variant}`] || styles['variant-primary'];

  return (
    <span
      role="status"
      aria-label={label}
      className={[styles.spinner, sizeClass, variantClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
