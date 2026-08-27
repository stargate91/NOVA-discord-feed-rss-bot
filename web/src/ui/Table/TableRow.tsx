import React from 'react';
import type { TableRowProps } from './types';
import styles from './Table.module.css';

export const TableRow: React.FC<TableRowProps> = ({
  selected = false,
  children,
  className = '',
  ...rest
}) => (
  <tr className={`${styles.tr} ${selected ? styles.trSelected : ''} ${className}`} {...rest}>
    {children}
  </tr>
);
