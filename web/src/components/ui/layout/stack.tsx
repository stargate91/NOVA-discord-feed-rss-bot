import React from 'react';
import styles from './layout.module.css';

export type SpacingGap = 'none' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type LayoutJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: SpacingGap;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  as?: React.ElementType;
}

export function Stack({
  children,
  gap = 'md',
  align,
  justify,
  as: Component = 'div',
  className,
  ...props
}: StackProps) {
  const gapClass = styles[`gap-${gap}`] || styles['gap-md'];
  const alignClass = align ? styles[`align-${align}`] : '';
  const justifyClass = justify ? styles[`justify-${justify}`] : '';

  const combinedClassName = [
    styles.stack,
    gapClass,
    alignClass,
    justifyClass,
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
