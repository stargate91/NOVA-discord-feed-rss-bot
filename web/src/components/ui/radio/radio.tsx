"use client";

import React, { createContext, useContext } from 'react';
import styles from './radio.module.css';

interface RadioGroupContextValue<T = string> {
  value: T;
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue<any> | null>(null);

export interface RadioGroupProps<T = string> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: T;
  onChange: (value: T) => void;
  name?: string;
  horizontal?: boolean;
  disabled?: boolean;
}

export function RadioGroup<T = string>({
  value,
  onChange,
  name,
  horizontal = false,
  disabled = false,
  children,
  className,
  ...props
}: RadioGroupProps<T>) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange, name, disabled }}>
      <div
        role="radiogroup"
        className={[
          styles['radio-group'],
          horizontal && styles.horizontal,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps<T = string> {
  value: T;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Radio<T = string>({
  value,
  label,
  description,
  disabled = false,
  className,
}: RadioProps<T>) {
  const context = useContext(RadioGroupContext);
  const isChecked = context?.value === value;
  const isDisabled = context?.disabled || disabled;

  const handleSelect = () => {
    if (!isDisabled && context) {
      context.onChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isChecked}
      tabIndex={isDisabled ? -1 : 0}
      className={[
        styles['radio-item'],
        isDisabled && styles.disabled,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <div
        className={[
          styles['radio-circle'],
          isChecked && styles.checked,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isChecked && <div className={styles['radio-dot']} aria-hidden="true" />}
      </div>

      {(label || description) && (
        <div className={styles['radio-label-wrapper']}>
          {label && <span className={styles['radio-label']}>{label}</span>}
          {description && (
            <span className={styles['radio-description']}>{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
