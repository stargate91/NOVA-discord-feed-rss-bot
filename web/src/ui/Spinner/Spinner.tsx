import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';
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

export const Spinner: React.FC<SpinnerProps> = ({
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
  const iconPixelSize = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 36,
    xl: 48,
  }[size] || 24;

  const sizeClass = {
    xs: styles.sizeXs,
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
  }[size] || styles.sizeMd;

  const variantClass = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    white: styles.variantWhite,
    success: styles.variantSuccess,
    danger: styles.variantDanger,
  }[variant] || styles.variantPrimary;

  const posClass = labelPosition === 'bottom' ? styles.posBottom : styles.posRight;

  const classes = [
    styles.container,
    sizeClass,
    variantClass,
    posClass,
    centered ? styles.centered : '',
    overlay ? styles.overlay : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} role="status" aria-live="polite" className={classes} {...rest}>
      <span className={styles.icon}>
        <Loader2 size={iconPixelSize} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};
