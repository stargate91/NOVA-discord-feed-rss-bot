import React from 'react';
import styles from './text.module.css';

export type TextSize =
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

export type TextVariant =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'faint'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'master'
  | 'gradient-primary'
  | 'gradient-master';

export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  size?: TextSize;
  weight?: TextWeight;
  variant?: TextVariant;
  align?: TextAlign;
  displayFont?: boolean;
  mono?: boolean;
  truncate?: boolean;
  balance?: boolean;
}

export function Text({
  children,
  as: Component = 'span',
  size = 'base',
  weight = 'regular',
  variant = 'primary',
  align,
  displayFont = false,
  mono = false,
  truncate = false,
  balance = false,
  className,
  ...props
}: TextProps) {
  const sizeClass = styles[`size-${size}`] || styles['size-base'];
  const weightClass = styles[`weight-${weight}`] || styles['weight-regular'];
  const variantClass = styles[`variant-${variant}`] || styles['variant-primary'];
  const alignClass = align ? styles[`align-${align}`] : '';
  const fontClass = mono ? styles['font-mono'] : displayFont ? styles['font-display'] : '';
  const truncateClass = truncate ? styles.truncate : '';
  const balanceClass = balance ? styles.balance : '';

  const combinedClassName = [
    styles.text,
    sizeClass,
    weightClass,
    variantClass,
    alignClass,
    fontClass,
    truncateClass,
    balanceClass,
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

export function Heading({
  children,
  level = 2,
  size,
  weight = 'semibold',
  variant = 'primary',
  className,
  ...props
}: Omit<TextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const tag = `h${level}` as React.ElementType;
  const defaultSizeMap: Record<number, TextSize> = {
    1: '3xl',
    2: '2xl',
    3: 'xl',
    4: 'lg',
    5: 'base',
    6: 'sm',
  };

  return (
    <Text
      as={tag}
      size={size || defaultSizeMap[level]}
      weight={weight}
      variant={variant}
      displayFont
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}
