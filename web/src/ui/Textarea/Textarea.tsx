import type { TextareaHTMLAttributes, ReactNode, MouseEvent } from 'react';
import React, { useState, useRef } from 'react';
import { Copy, Check, X } from 'lucide-react';
import styles from './Textarea.module.css';

export type TextareaVariant = 'default' | 'filled' | 'glass';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: ReactNode;
  variant?: TextareaVariant;
  resize?: TextareaResize;
  showCount?: boolean;
  copyable?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  className?: string;
  id?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  variant = 'default',
  resize = 'vertical',
  showCount = false,
  copyable = false,
  clearable = false,
  onClear,
  maxLength,
  value,
  defaultValue,
  onChange,
  disabled,
  rows = 4,
  className = '',
  id,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState<string | number | readonly string[]>(
    defaultValue ?? ''
  );
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const currentLength = String(currentValue ?? '').length;

  const textareaId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    if (textareaRef.current) {
      textareaRef.current.focus();
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

  const variantClass = {
    default: styles.variantDefault,
    filled: styles.variantFilled,
    glass: styles.variantGlass,
  }[variant] || styles.variantDefault;

  const resizeClass = {
    none: styles.resizeNone,
    vertical: styles.resizeVertical,
    horizontal: styles.resizeHorizontal,
    both: styles.resizeBoth,
  }[resize] || styles.resizeVertical;

  const wrapperClasses = [
    styles.controlWrapper,
    variantClass,
    error ? styles.hasError : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const hasFooter = showCount || copyable || (clearable && Boolean(currentValue));

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={`${styles.control} ${resizeClass}`}
          {...rest}
        />

        {hasFooter && (
          <div className={styles.footer}>
            <div className={styles.actions}>
              {clearable && Boolean(currentValue) && !disabled && (
                <button
                  type="button"
                  aria-label="Clear text"
                  className={styles.actionBtn}
                  onClick={handleClear}
                >
                  <X size={14} />
                </button>
              )}

              {copyable && (
                <button
                  type="button"
                  aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
                  className={styles.actionBtn}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>

            {showCount && (
              <span className={styles.count}>
                {currentLength}
                {maxLength !== undefined ? ` / ${maxLength}` : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
