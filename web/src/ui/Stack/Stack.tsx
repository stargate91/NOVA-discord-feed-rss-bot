import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './Stack.module.css';

export type StackDirection = 'column' | 'row' | 'column-reverse' | 'row-reverse';
export type StackGap =
  | 'none'
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Stack: React.FC<StackProps> = ({
  as: Component = 'div',
  direction = 'column',
  gap = 'md',
  align,
  justify,
  wrap = false,
  fullWidth = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const dirMap: Record<StackDirection, string> = {
    column: styles.dirColumn,
    row: styles.dirRow,
    'column-reverse': styles.dirColumnReverse,
    'row-reverse': styles.dirRowReverse,
  };

  const gapMap: Record<StackGap, string> = {
    none: styles.gapNone,
    '3xs': styles.gap3xs,
    '2xs': styles.gap2xs,
    xs: styles.gapXs,
    sm: styles.gapSm,
    md: styles.gapMd,
    lg: styles.gapLg,
    xl: styles.gapXl,
    '2xl': styles.gap2xl,
    '3xl': styles.gap3xl,
    '4xl': styles.gap4xl,
    '5xl': styles.gap5xl,
  };

  const alignMap: Record<StackAlign, string> = {
    start: styles.alignStart,
    center: styles.alignCenter,
    end: styles.alignEnd,
    stretch: styles.alignStretch,
    baseline: styles.alignBaseline,
  };

  const justifyMap: Record<StackJustify, string> = {
    start: styles.justifyStart,
    center: styles.justifyCenter,
    end: styles.justifyEnd,
    between: styles.justifyBetween,
    around: styles.justifyAround,
    evenly: styles.justifyEvenly,
  };

  const classes = [
    styles.stack,
    dirMap[direction],
    gapMap[gap],
    align ? alignMap[align] : '',
    justify ? justifyMap[justify] : '',
    wrap ? styles.wrap : '',
    fullWidth ? styles.fullWidth : '',
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
