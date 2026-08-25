import React from 'react';
import styles from './layout.module.css';
import { SpacingGap, LayoutAlign, LayoutJustify } from './Stack';

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: SpacingGap;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  wrap?: boolean;
  as?: React.ElementType;
}

export function Inline({
  children,
  gap = 'sm',
  align = 'center',
  justify,
  wrap = false,
  as: Component = 'div',
  className,
  ...props
}: InlineProps) {
  const gapClass = styles[`gap-${gap}`] || styles['gap-sm'];
  const alignClass = align ? styles[`align-${align}`] : styles['align-center'];
  const justifyClass = justify ? styles[`justify-${justify}`] : '';
  const wrapClass = wrap ? styles['inline-wrap'] : styles['inline-nowrap'];

  const combinedClassName = [
    styles.inline,
    gapClass,
    alignClass,
    justifyClass,
    wrapClass,
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
