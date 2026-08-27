import type { HTMLAttributes, ReactNode } from 'react';
import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Spinner.module.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'success' | 'danger';
export type SpinnerLabelPosition = 'right' | 'bottom';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: ReactNode;
  labelPosition?: SpinnerLabelPosition;
  centered?: boolean;
  overlay?: boolean;
  className?: string;
  id?: string;
}

const SpinnerComponent: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label,
  labelPosition = 'right',
  centered = false,
  overlay = false,
  className = '',
  id,
  ...rest
}) => {
  const iconPixelSize =
    {
      xs: 14,
      sm: 18,
      md: 24,
      lg: 36,
      xl: 48,
    }[size] || 24;

  const sizeClass =
    {
      xs: styles.sizeXs,
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
      xl: styles.sizeXl,
    }[size] || styles.sizeMd;

  const variantClass =
    {
      primary: styles.variantPrimary,
      secondary: styles.variantSecondary,
      white: styles.variantWhite,
      success: styles.variantSuccess,
      danger: styles.variantDanger,
    }[variant] || styles.variantPrimary;

  const posClass = labelPosition === 'bottom' ? styles.posBottom : styles.posRight;

  const content = (
    <div
      id={id}
      role="status"
      aria-live="polite"
      className={`${styles.container} ${posClass} ${className}`}
      {...rest}
    >
      <Loader2
        size={iconPixelSize}
        className={`${styles.spinner} ${variantClass} ${sizeClass}`}
        aria-hidden="true"
      />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );

  if (overlay) {
    return <div className={styles.overlay}>{content}</div>;
  }

  if (centered) {
    return <div className={styles.centeredWrapper}>{content}</div>;
  }

  return content;
};

export const Spinner = memo(SpinnerComponent);
