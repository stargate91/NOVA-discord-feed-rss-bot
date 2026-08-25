import React from 'react';
import styles from './layout.module.css';
import { SpacingGap } from './Stack';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fit' | 'cards';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: SpacingGap;
  as?: React.ElementType;
}

export function Grid({
  children,
  columns = 'cards',
  gap = 'lg',
  as: Component = 'div',
  className,
  ...props
}: GridProps) {
  const colsClass = styles[`cols-${columns}`] || styles['cols-cards'];
  const gapClass = styles[`gap-${gap}`] || styles['gap-lg'];

  const combinedClassName = [
    styles.grid,
    colsClass,
    gapClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
}
