import React from 'react';
import styles from './card.module.css';

export type CardVariant = 'default' | 'interactive' | 'elevated' | 'neon';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({
  children,
  variant = 'default',
  className,
  ...props
}: CardProps) {
  const variantClass = styles[`card-${variant}`] || styles['card-default'];

  const combinedClassName = [
    styles.card,
    variantClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['card-header'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={[styles['card-title'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={[styles['card-description'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['card-content'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['card-footer'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}
