import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { AccordionTriggerProps } from './types';
import { useAccordion, useAccordionItem } from './context';
import styles from './Accordion.module.css';

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
