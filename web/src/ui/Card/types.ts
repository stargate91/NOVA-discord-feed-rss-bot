import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type CardGlow = 'none' | 'blue' | 'purple' | 'green' | 'danger';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardVariant =
  'default' | 'surface' | 'glass' | 'elevated' | 'ghost' | 'gradient-border';
export type CardBorderAccent = 'none' | 'left' | 'top';

export type CardHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  as?: ElementType;
  title?: ReactNode;
  titleAs?: CardHeadingLevel;
  subtitle?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  interactive?: boolean;
  variant?: CardVariant;
  borderAccent?: CardBorderAccent;
  headerDivided?: boolean;
  footerDivided?: boolean;
  glow?: CardGlow;
  padding?: CardPadding;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: CardHeadingLevel;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}
