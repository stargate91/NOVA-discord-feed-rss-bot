import React, { useState } from 'react';
import type { AccordionProps } from './types';
import { AccordionContext } from './context';
import styles from './Accordion.module.css';

export const AccordionRoot: React.FC<AccordionProps> = ({
  type = 'single',
  variant = 'default',
  value: controlledValue,
  defaultValue,
  onChange,
  children,
  className = '',
  id,
  ...rest
}) => {
  const getInitialValues = (): string[] => {
    if (defaultValue === undefined) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  };

  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(getInitialValues);

  const isControlled = controlledValue !== undefined;
  const openValues = isControlled
    ? Array.isArray(controlledValue)
      ? controlledValue
      : controlledValue
        ? [controlledValue]
        : []
    : uncontrolledValues;

  const toggleValue = (val: string) => {
    let nextValues: string[];

    if (type === 'single') {
      nextValues = openValues.includes(val) ? [] : [val];
    } else {
      nextValues = openValues.includes(val)
        ? openValues.filter((v) => v !== val)
        : [...openValues, val];
    }

    if (!isControlled) {
      setUncontrolledValues(nextValues);
    }

    onChange?.(type === 'single' ? (nextValues[0] ?? '') : nextValues);
  };

  const variantClass =
    {
      default: styles.variantDefault,
      card: styles.variantCard,
      glass: styles.variantGlass,
      bordered: styles.variantBordered,
    }[variant] || styles.variantDefault;

  return (
    <AccordionContext.Provider value={{ type, openValues, toggleValue, variant }}>
      <div id={id} className={`${styles.accordion} ${variantClass} ${className}`} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};
