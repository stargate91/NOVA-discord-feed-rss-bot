import React from 'react';
import type { TableBodyProps } from './types';
import styles from './Table.module.css';

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '', ...rest }) => (
  <tbody className={`${styles.tbody} ${className}`} {...rest}>
    {children}
  </tbody>
);
