"use client";

import React from 'react';
import styles from './switch.module.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: SwitchProps) {
  const switchId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

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
      className={[
        styles['switch-wrapper'],
        disabled && styles.disabled,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleToggle}
    >
      {(label || description) && (
        <div className={styles['switch-info']}>
          {label && (
            <label htmlFor={switchId} className={styles['switch-label']}>
              {label}
            </label>
          )}
          {description && (
            <span className={styles['switch-description']}>{description}</span>
          )}
        </div>
      )}

      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={[
          styles['switch-track'],
          checked && styles.checked,
        ]
          .filter(Boolean)
          .join(' ')}
        onKeyDown={handleKeyDown}
      >
        <span className={styles['switch-thumb']} aria-hidden="true" />
      </button>
    </div>
  );
}
