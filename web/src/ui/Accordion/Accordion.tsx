import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'card' | 'glass' | 'bordered';

interface AccordionContextValue {
  type: AccordionType;
  openValues: string[];
  toggleValue: (val: string) => void;
  variant: AccordionVariant;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion subcomponents must be used within an <Accordion>');
  }
  return context;
};

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger and AccordionContent must be used within an <Accordion.Item>');
  }
  return context;
};

/* --------------------------------------------------------------------------
   Root Accordion Component
   -------------------------------------------------------------------------- */
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type?: AccordionType;
  variant?: AccordionVariant;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

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

    onChange?.(type === 'single' ? nextValues[0] ?? '' : nextValues);
  };

  const variantClass = {
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

/* --------------------------------------------------------------------------
   Accordion.Item
   -------------------------------------------------------------------------- */
export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  disabled = false,
  children,
  className = '',
  ...rest
}) => {
  const { openValues } = useAccordion();
  const isOpen = openValues.includes(value);

  const classes = [
    styles.item,
    isOpen ? styles.open : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, disabled }}>
      <div className={classes} {...rest}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

/* --------------------------------------------------------------------------
   Accordion.Trigger
   -------------------------------------------------------------------------- */
export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  icon,
  children,
  className = '',
  ...rest
}) => {
  const { toggleValue } = useAccordion();
  const { value, isOpen, disabled } = useAccordionItem();

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      disabled={disabled}
      className={`${styles.trigger} ${className}`}
      onClick={() => toggleValue(value)}
      {...rest}
    >
      <span className={styles.triggerLeft}>
        {icon && <span className={styles.triggerIcon}>{icon}</span>}
        <span>{children}</span>
      </span>
      <span className={styles.chevron}>
        <ChevronDown size={18} />
      </span>
    </button>
  );
};

/* --------------------------------------------------------------------------
   Accordion.Content
   -------------------------------------------------------------------------- */
export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className = '',
  ...rest
}) => {
  const { isOpen } = useAccordionItem();

  return (
    <div
      role="region"
      aria-hidden={!isOpen}
      className={styles.contentWrapper}
    >
      <div className={styles.contentInner}>
        <div className={`${styles.content} ${className}`} {...rest}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   Compound Export
   -------------------------------------------------------------------------- */
interface AccordionCompound extends React.FC<AccordionProps> {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
}

export const Accordion = AccordionRoot as AccordionCompound;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
