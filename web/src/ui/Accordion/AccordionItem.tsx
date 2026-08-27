import React from 'react';
import type { AccordionItemProps } from './types';
import { useAccordion, AccordionItemContext } from './context';
import styles from './Accordion.module.css';

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
