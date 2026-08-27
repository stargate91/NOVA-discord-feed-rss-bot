import React from 'react';
import type { AccordionContentProps } from './types';
import { useAccordionItem } from './context';
import styles from './Accordion.module.css';

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className = '',
  ...rest
}) => {
  const { isOpen } = useAccordionItem();

  return (
    <div role="region" aria-hidden={!isOpen} className={styles.contentWrapper}>
      <div className={styles.contentInner}>
        <div className={`${styles.content} ${className}`} {...rest}>
          {children}
        </div>
      </div>
    </div>
  );
};
