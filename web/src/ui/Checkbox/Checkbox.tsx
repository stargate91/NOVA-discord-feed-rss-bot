import type { InputHTMLAttributes, ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import styles from './Checkbox.module.css';

export interface CheckboxGroupContextValue {
  value?: string[];
  onChange?: (val: string, checked: boolean) => void;
  disabled?: boolean;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

/* --------------------------------------------------------------------------
   CheckboxGroup Component
   -------------------------------------------------------------------------- */
export type CheckboxGroupDirection = 'vertical' | 'horizontal';

export interface CheckboxGroupProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  direction?: CheckboxGroupDirection;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  onChange,
  direction = 'vertical',
  disabled = false,
  children,
  className = '',
  id,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const handleItemChange = (itemValue: string, isChecked: boolean) => {
    let nextValue: string[];
    if (isChecked) {
      nextValue = [...currentValue, itemValue];
    } else {
      nextValue = currentValue.filter((v) => v !== itemValue);
    }

    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const dirClass = direction === 'horizontal' ? styles.dirHorizontal : styles.dirVertical;

  return (
    <CheckboxGroupContext.Provider
      value={{
        value: currentValue,
        onChange: handleItemChange,
        disabled,
      }}
    >
      <div id={id} role="group" className={`${styles.group} ${dirClass} ${className}`}>
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

/* --------------------------------------------------------------------------
   Checkbox Component
   -------------------------------------------------------------------------- */
export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxColor = 'primary' | 'success' | 'danger';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
  card?: boolean;
  size?: CheckboxSize;
  color?: CheckboxColor;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  label,
  description,
  indeterminate = false,
  card = false,
  size = 'md',
  color = 'primary',
  checked: controlledChecked,
  defaultChecked,
  disabled: itemDisabled,
  onChange,
  children,
  className = '',
  id,
  ...rest
}) => {
  const group = useContext(CheckboxGroupContext);
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked ?? false);

  const isGroupItem = Boolean(group && value !== undefined);
  const isChecked = isGroupItem
    ? (group?.value?.includes(String(value)) ?? false)
    : controlledChecked !== undefined
      ? controlledChecked
      : uncontrolledChecked;

  const isDisabled = group?.disabled || itemDisabled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const nextChecked = e.target.checked;

    if (isGroupItem && value !== undefined) {
      group?.onChange?.(String(value), nextChecked);
    } else if (controlledChecked === undefined) {
      setUncontrolledChecked(nextChecked);
    }

    onChange?.(e);
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

  const checkIconSize =
    {
      sm: 10,
      md: 12,
      lg: 16,
    }[size] || 12;

  const content = children ?? (
    <div className={styles.content}>
      {label && <span className={styles.label}>{label}</span>}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );

  const labelClasses = [
    styles.checkboxLabel,
    sizeClass,
    colorClass,
    card ? styles.card : '',
    isChecked ? styles.checked : '',
    indeterminate ? styles.indeterminate : '',
    isDisabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label id={id} className={labelClasses}>
      <input
        type="checkbox"
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className={styles.hiddenInput}
        {...rest}
      />
      <span className={styles.box} aria-hidden="true">
        {indeterminate ? (
          <Minus size={checkIconSize} />
        ) : isChecked ? (
          <Check size={checkIconSize} />
        ) : null}
      </span>
      {content}
    </label>
  );
};
