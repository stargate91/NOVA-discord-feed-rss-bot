import React from 'react';
import type { GridItemProps } from './types';
import { colSpanMap, colStartMap, rowSpanMap } from './mappings';
import styles from './Grid.module.css';

export const GridItem: React.FC<GridItemProps> = ({
  as: Component = 'div',
  colSpan,
  colStart,
  rowSpan,
  children,
  className = '',
  id,
  ...rest
}) => {
  const classes = [
    styles.item,
    colSpan ? colSpanMap[String(colSpan)] : '',
    colStart ? colStartMap[String(colStart)] : '',
    rowSpan ? rowSpanMap[String(rowSpan)] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component id={id} className={classes} {...rest}>
      {children}
    </Component>
  );
};
