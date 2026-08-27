import type React from 'react';
import type { GridProps } from './types';
import {
  colMap,
  minItemMap,
  gapMap,
  rowGapMap,
  colGapMap,
  alignMap,
  justifyMap,
} from './mappings';
import { GridItem } from './GridItem';
import styles from './Grid.module.css';

export * from './types';
export * from './mappings';
export * from './GridItem';

export const Grid: React.FC<GridProps> & { Item: typeof GridItem } = ({
  as: Component = 'div',
  columns = 1,
  minItemWidth,
  gap = 'md',
  rowGap,
  columnGap,
  align,
  justify,
  children,
  className = '',
  id,
  ...rest
}) => {
  const colClass = minItemWidth
    ? minItemMap[minItemWidth]
    : colMap[String(columns)] || styles.cols1;

  const classes = [
    styles.grid,
    colClass,
    gapMap[gap],
    rowGap ? rowGapMap[rowGap] : '',
    columnGap ? colGapMap[columnGap] : '',
    align ? alignMap[align] : '',
    justify ? justifyMap[justify] : '',
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

Grid.Item = GridItem;
