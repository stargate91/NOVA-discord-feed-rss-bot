import React from 'react';
import styles from './badge.module.css';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'master' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  className,
  ...props
}: BadgeProps) {
  const variantClass = styles[`badge-${variant}`] || styles['badge-primary'];
  const sizeClass = styles[`badge-${size}`] || styles['badge-md'];

  const combinedClassName = [
    styles.badge,
    variantClass,
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={combinedClassName} {...props}>
      {dot && <span className={styles['badge-dot']} aria-hidden="true" />}
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
