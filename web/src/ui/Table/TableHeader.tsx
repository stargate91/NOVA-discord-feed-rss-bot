import React from 'react';
import type { TableHeaderProps } from './types';
import styles from './Table.module.css';

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '', ...rest }) => (
  <thead className={`${styles.thead} ${className}`} {...rest}>
    {children}
  </thead>
);
