"use client";

import React, { forwardRef, useState } from 'react';
import styles from './input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      inputSize = 'md',
      leftIcon,
      rightIcon,
      disabled,
      required,
      className,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const containerClasses = [
      styles['input-container'],
      styles[`size-${inputSize}`],
      isFocused && styles.focused,
      error && styles.error,
      disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={[styles['input-wrapper'], className].filter(Boolean).join(' ')}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            <span>{label}</span>
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={containerClasses}>
          {leftIcon && (
            <span className={[styles['icon-slot'], styles['icon-left']].join(' ')}>
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={styles['input-field']}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightIcon && (
            <span className={[styles['icon-slot'], styles['icon-right']].join(' ')}>
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <span id={`${inputId}-error`} className={styles['error-text']} role="alert">
            {error}
          </span>
        )}
        {!error && hint && (
          <span id={`${inputId}-hint`} className={styles['hint-text']}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      disabled,
      required,
      className,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const containerClasses = [
      styles['input-container'],
      styles['textarea-container'],
      isFocused && styles.focused,
      error && styles.error,
      disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={[styles['input-wrapper'], className].filter(Boolean).join(' ')}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            <span>{label}</span>
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={containerClasses}>
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            required={required}
            className={styles['textarea-field']}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
            {...props}
          />
        </div>

        {error && (
          <span id={`${textareaId}-error`} className={styles['error-text']} role="alert">
            {error}
          </span>
        )}
        {!error && hint && (
          <span id={`${textareaId}-hint`} className={styles['hint-text']}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
