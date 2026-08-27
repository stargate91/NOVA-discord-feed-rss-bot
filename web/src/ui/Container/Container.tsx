import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './Container.module.css';

export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  maxWidth?: ContainerMaxWidth;
  centered?: boolean;
  padding?: ContainerPadding;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Container: React.FC<ContainerProps> = ({
  as: Component = 'div',
  maxWidth = 'lg',
  centered = true,
  padding = 'none',
  children,
  className = '',
  id,
  ...rest
}) => {
  const maxWidthMap: Record<ContainerMaxWidth, string> = {
    xs: styles.maxWidthXs,
    sm: styles.maxWidthSm,
    md: styles.maxWidthMd,
    lg: styles.maxWidthLg,
    xl: styles.maxWidthXl,
    full: styles.maxWidthFull,
  };

  const padMap: Record<ContainerPadding, string> = {
    none: styles.padNone,
    sm: styles.padSm,
    md: styles.padMd,
    lg: styles.padLg,
    xl: styles.padXl,
  };

  const classes = [
    styles.container,
    maxWidthMap[maxWidth] || styles.maxWidthLg,
    padMap[padding] || styles.padNone,
    centered ? styles.centered : '',
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
