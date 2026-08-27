import type { InputHTMLAttributes, ReactNode, MouseEvent } from 'react';
import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Copy, Check, X } from 'lucide-react';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'glass';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: ReactNode;
  error?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  passwordToggle?: boolean;
  copyable?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  size?: InputSize;
  variant?: InputVariant;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  passwordToggle = false,
  copyable = false,
  clearable = false,
  onClear,
  size = 'md',
  variant = 'default',
  type = 'text',
  value,
  defaultValue,
  onChange,
  disabled,
  className = '',
  id,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState<string | number | readonly string[]>(
    defaultValue ?? ''
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const effectiveType = passwordToggle ? (showPassword ? 'text' : 'password') : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isControlled) {
      setInternalValue('');
    }
    onClear?.();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (currentValue !== undefined && currentValue !== null) {
      await navigator.clipboard.writeText(String(currentValue));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const iconPixelSize = {
    sm: 14,
    md: 16,
    lg: 18,
  }[size] || 16;

  const wrapperClasses = [
    styles.wrapper,
    sizeClass,
    variantClass,
    error ? styles.hasError : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const hasActionButtons = passwordToggle || copyable || (clearable && Boolean(currentValue));

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        {prefix && <span className={styles.affix}>{prefix}</span>}
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

        <input
          ref={inputRef}
          id={inputId}
          type={effectiveType}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={styles.control}
          {...rest}
        />

        {rightIcon && !hasActionButtons && <span className={styles.icon}>{rightIcon}</span>}

        {hasActionButtons && (
          <div className={styles.actionGroup}>
            {clearable && Boolean(currentValue) && !disabled && (
              <button
                type="button"
                aria-label="Clear input"
                className={styles.actionBtn}
                onClick={handleClear}
              >
                <X size={iconPixelSize} />
              </button>
            )}

            {passwordToggle && !disabled && (
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className={styles.actionBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={iconPixelSize} /> : <Eye size={iconPixelSize} />}
              </button>
            )}

            {copyable && (
              <button
                type="button"
                aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
                className={styles.actionBtn}
                onClick={handleCopy}
              >
                {copied ? <Check size={iconPixelSize} /> : <Copy size={iconPixelSize} />}
              </button>
            )}
          </div>
        )}

        {suffix && <span className={`${styles.affix} ${styles.suffix}`}>{suffix}</span>}
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
