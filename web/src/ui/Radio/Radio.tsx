import type { InputHTMLAttributes, ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import styles from './Radio.module.css';

export interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/* --------------------------------------------------------------------------
   RadioGroup Component
   -------------------------------------------------------------------------- */
export type RadioGroupDirection = 'vertical' | 'horizontal';

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  direction?: RadioGroupDirection;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  direction = 'vertical',
  disabled = false,
  children,
  className = '',
  id,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onChange?.(val);
  };

  const dirClass = direction === 'horizontal' ? styles.dirHorizontal : styles.dirVertical;

  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value: currentValue,
        onChange: handleChange,
        disabled,
      }}
    >
      <div id={id} role="radiogroup" className={`${styles.group} ${dirClass} ${className}`}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

/* --------------------------------------------------------------------------
   Radio Component
   -------------------------------------------------------------------------- */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  card?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

const RadioBase: React.FC<RadioProps> = ({
  value,
  label,
  description,
  card = false,
  checked: controlledChecked,
  disabled: itemDisabled,
  onChange,
  children,
  className = '',
  id,
  ...rest
}) => {
  const group = useContext(RadioGroupContext);

  const isChecked = group
    ? group.value === value
    : controlledChecked !== undefined
      ? controlledChecked
      : false;

  const isDisabled = group?.disabled || itemDisabled;
  const name = group?.name || rest.name;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    if (group?.onChange) {
      group.onChange(value);
    }
    onChange?.(e);
  };

  const content = children ?? (
    <div className={styles.content}>
      {label && <span className={styles.label}>{label}</span>}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );

  const labelClasses = [
    styles.radioLabel,
    card ? styles.card : '',
    isChecked ? styles.checked : '',
    isDisabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label id={id} className={labelClasses}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className={styles.hiddenInput}
        {...rest}
      />
      <span className={styles.circle} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      {content}
    </label>
  );
};

export interface RadioCompound extends React.FC<RadioProps> {
  Group: typeof RadioGroup;
}

export const Radio = RadioBase as RadioCompound;
Radio.Group = RadioGroup;
