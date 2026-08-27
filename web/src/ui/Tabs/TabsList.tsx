import React from 'react';
import type { TabsListProps } from './types';
import { useTabs } from './context';
import styles from './Tabs.module.css';

export const TabsList: React.FC<TabsListProps> = ({ children, className = '', ...rest }) => {
  const { variant, size, orientation, fitted } = useTabs();

  const variantClass =
    {
      line: styles.variantLine,
      pill: styles.variantPill,
      card: styles.variantCard,
      glass: styles.variantGlass,
    }[variant] || styles.variantLine;

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const orientationClass = orientation === 'vertical' ? styles.verticalList : '';
  const fittedClass = fitted ? styles.fitted : '';

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={`${styles.list} ${variantClass} ${sizeClass} ${orientationClass} ${fittedClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
