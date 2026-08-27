import type { SelectHTMLAttributes, ReactNode } from 'react';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'filled' | 'glass';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode;
  error?: ReactNode;
  leftIcon?: ReactNode;
  placeholder?: string;
  options?: SelectOption[];
  size?: SelectSize;
  variant?: SelectVariant;
  children?: ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  leftIcon,
  placeholder,
  options,
  size = 'md',
  variant = 'default',
  disabled,
  children,
  className = '',
  id,
  ...rest
}) => {
  const selectId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] || styles.sizeMd;

  const variantClass = {
    default: styles.variantDefault,
    filled: styles.variantFilled,
    glass: styles.variantGlass,
  }[variant] || styles.variantDefault;

  const chevronPixelSize = {
    sm: 14,
    md: 16,
    lg: 18,
  }[size] || 16;

  const wrapperClasses = [
    styles.wrapper,
    sizeClass,
    variantClass,
    leftIcon ? styles.hasLeftIcon : '',
    error ? styles.hasError : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.selectGroup} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

        <select id={selectId} disabled={disabled} className={styles.control} {...rest}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <span className={styles.chevron} aria-hidden="true">
          <ChevronDown size={chevronPixelSize} />
        </span>
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
