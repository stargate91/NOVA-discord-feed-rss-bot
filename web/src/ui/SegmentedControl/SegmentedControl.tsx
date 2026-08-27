import type { HTMLAttributes, ReactNode } from 'react';
import React, { useState } from 'react';
import styles from './SegmentedControl.module.css';

export type SegmentedControlSize = 'sm' | 'md' | 'lg';

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode | number;
  disabled?: boolean;
  title?: string;
}

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  id,
  ...rest
}) => {
  const initialValue = defaultValue ?? (options.length > 0 ? options[0].value : '');
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(initialValue);

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const handleSelect = (val: string) => {
    if (disabled) return;
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onChange?.(val);
  };

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const containerClasses = [
    styles.container,
    sizeClass,
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} role="tablist" className={containerClasses} {...rest}>
      {options.map((option) => {
        const isSelected = activeValue === option.value;
        const isOptionDisabled = disabled || option.disabled;

        const segmentClasses = [styles.segment, isSelected ? styles.active : '']
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={isOptionDisabled}
            title={option.title}
            className={segmentClasses}
            onClick={() => handleSelect(option.value)}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge !== undefined && <span className={styles.badge}>{option.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
