import React from 'react';
import styles from './divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'subtle' | 'default' | 'strong' | 'accent' | 'gradient';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  label?: React.ReactNode;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'default',
  label,
  className,
  ...props
}: DividerProps) {
  const variantClass = styles[`variant-${variant}`] || '';

  if (label && orientation === 'horizontal') {
    return (
      <div
        role="separator"
        className={[styles['divider-with-label'], variantClass, className].filter(Boolean).join(' ')}
        {...props}
      >
        <span className={styles['divider-line']} />
        <span className={styles['divider-label']}>{label}</span>
        <span className={styles['divider-line']} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={[
        styles.divider,
        styles[orientation],
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
