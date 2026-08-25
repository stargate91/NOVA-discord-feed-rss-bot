import React from 'react';
import styles from './skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

export function Skeleton({
  variant = 'text',
  className,
  ...props
}: SkeletonProps) {
  const variantClass = styles[`variant-${variant}`] || styles['variant-text'];

  return (
    <div
      aria-hidden="true"
      className={[styles.skeleton, variantClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
