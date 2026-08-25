"use client";

import React from 'react';
import styles from './segmented_control.module.css';

export interface SegmentOption<T = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export function SegmentedControl<T = string>({
  options,
  value,
  onChange,
  fullWidth = false,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={[
        styles['control-container'],
        fullWidth && styles['full-width'],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((option, idx) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled;

        return (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            className={[
              styles['segment-item'],
              isSelected && styles.active,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => !isDisabled && onChange(option.value)}
          >
            {option.icon && <span aria-hidden="true">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
