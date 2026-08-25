"use client";

import React from 'react';
import { Check, Minus } from 'lucide-react';
import styles from './checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  label,
  description,
  disabled = false,
  id,
  className,
}: CheckboxProps) {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      tabIndex={disabled ? -1 : 0}
      className={[
        styles['checkbox-wrapper'],
        disabled && styles.disabled,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <div
        id={checkboxId}
        className={[
          styles['checkbox-box'],
          (checked || indeterminate) && styles.checked,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {indeterminate ? (
          <Minus size={12} strokeWidth={3} aria-hidden="true" />
        ) : checked ? (
          <Check size={12} strokeWidth={3} aria-hidden="true" />
        ) : null}
      </div>

      {(label || description) && (
        <div className={styles['checkbox-label-wrapper']}>
          {label && <span className={styles['checkbox-label']}>{label}</span>}
          {description && (
            <span className={styles['checkbox-description']}>{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
