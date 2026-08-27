import type { InputHTMLAttributes, ReactNode } from 'react';
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Switch.module.css';

export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchColor = 'primary' | 'success' | 'danger';

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: SwitchSize;
  color?: SwitchColor;
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  label,
  description,
  size = 'md',
  color = 'primary',
  loading = false,
  disabled = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);

  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : uncontrolledChecked;
  const isDisabled = disabled || loading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const nextChecked = e.target.checked;
    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }
    onChange?.(nextChecked);
  };

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const colorClass =
    {
      primary: '',
      success: styles.colorSuccess,
      danger: styles.colorDanger,
    }[color] || '';

  const spinnerSize =
    {
      sm: 8,
      md: 10,
      lg: 12,
    }[size] || 10;

  const content = children ?? (
    <div className={styles.content}>
      {label && <span className={styles.label}>{label}</span>}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );

  const wrapperClasses = [
    styles.wrapper,
    sizeClass,
    colorClass,
    isChecked ? styles.checked : '',
    isDisabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label id={id} className={wrapperClasses}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={isChecked}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className={styles.hiddenInput}
        {...rest}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb}>
          {loading && (
            <span className={styles.spinner}>
              <Loader2 size={spinnerSize} />
            </span>
          )}
        </span>
      </span>
      {content}
    </label>
  );
};
