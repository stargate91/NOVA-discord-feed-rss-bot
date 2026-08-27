import type { HTMLAttributes, ReactNode } from 'react';
import React, { useRef, useEffect } from 'react';
import styles from './ProgressBar.module.css';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'brand' | 'success' | 'warning' | 'danger' | 'purple';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => ReactNode;
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
  className?: string;
  id?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  valueFormat,
  size = 'md',
  variant = 'brand',
  className = '',
  id,
  ...rest
}) => {
  const fillRef = useRef<HTMLDivElement>(null);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = `${percentage}%`;
    }
  }, [percentage]);

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const variantClass =
    {
      brand: styles.variantBrand,
      success: styles.variantSuccess,
      warning: styles.variantWarning,
      danger: styles.variantDanger,
      purple: styles.variantPurple,
    }[variant] || styles.variantBrand;

  const renderedValue = valueFormat ? valueFormat(value, max) : `${Math.round(percentage)}%`;

  return (
    <div
      id={id}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`${styles.wrapper} ${sizeClass} ${variantClass} ${className}`}
      {...rest}
    >
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.value}>{renderedValue}</span>}
        </div>
      )}

      <div className={styles.track}>
        <div ref={fillRef} className={styles.fill} />
      </div>
    </div>
  );
};
