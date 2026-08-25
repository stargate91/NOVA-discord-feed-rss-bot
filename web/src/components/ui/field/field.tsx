import React from 'react';
import styles from './field.module.css';

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
}

export function Field({
  label,
  hint,
  error,
  required = false,
  optional = false,
  htmlFor,
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <div className={[styles['field-wrapper'], className].filter(Boolean).join(' ')} {...props}>
      {(label || optional) && (
        <div className={styles['label-wrapper']}>
          {label && (
            <label htmlFor={htmlFor} className={styles.label}>
              <span>{label}</span>
              {required && <span className={styles.required}>*</span>}
            </label>
          )}
          {optional && <span className={styles.optional}>(Optional)</span>}
        </div>
      )}

      <div className={styles['field-control']}>{children}</div>

      {error && (
        <span className={styles['error-text']} role="alert">
          {error}
        </span>
      )}
      {!error && hint && <span className={styles['hint-text']}>{hint}</span>}
    </div>
  );
}
