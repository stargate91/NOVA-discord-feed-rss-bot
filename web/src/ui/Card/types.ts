import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type CardGlow = 'none' | 'blue' | 'purple' | 'green' | 'danger';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardVariant =
  'default' | 'surface' | 'glass' | 'elevated' | 'ghost' | 'gradient-border';
export type CardBorderAccent = 'none' | 'left' | 'top';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  as?: ElementType;
  title?: ReactNode;
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

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}
