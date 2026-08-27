import React from 'react';
import type { TableCellProps } from './types';
import styles from './Table.module.css';

export const TableCell: React.FC<TableCellProps> = ({
  align = 'left',
  checkbox = false,
  children,
  className = '',
  ...rest
}) => {
  const alignClass =
    {
      left: styles.alignLeft,
      center: styles.alignCenter,
      right: styles.alignRight,
    }[align] || styles.alignLeft;

  const classes = [styles.td, alignClass, checkbox ? styles.checkboxCell : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <td className={classes} {...rest}>
      {children}
    </td>
  );
};
