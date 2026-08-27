import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import { Spinner } from '../Spinner/Spinner';
import styles from './Card.module.css';

export type CardGlow = 'none' | 'blue' | 'purple' | 'green' | 'danger';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  interactive?: boolean;
  glow?: CardGlow;
  padding?: CardPadding;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export const CardRoot: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  action,
  interactive = false,
  glow = 'none',
  padding = 'lg',
  loading = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const padClass = {
    none: styles.padNone,
    sm: styles.padSm,
    md: styles.padMd,
    lg: styles.padLg,
    xl: styles.padXl,
  }[padding] || styles.padLg;

  const glowClass = {
    none: '',
    blue: styles.glowBlue,
    purple: styles.glowPurple,
    green: styles.glowGreen,
    danger: styles.glowDanger,
  }[glow] || '';

  const classes = [
    styles.card,
    padClass,
    glowClass,
    interactive ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const descText = description ?? subtitle;
  const hasMonolithicHeader = Boolean(title || descText || action);

  return (
    <div id={id} className={classes} {...rest}>
      {loading && <Spinner overlay />}

      {hasMonolithicHeader && (
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {title && (typeof title === 'string' ? <h3 className={styles.title}>{title}</h3> : title)}
            {descText && (typeof descText === 'string' ? <p className={styles.description}>{descText}</p> : descText)}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}

      {hasMonolithicHeader ? <div className={styles.body}>{children}</div> : children}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Card Compound Subcomponents
   -------------------------------------------------------------------------- */
export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => <div className={`${styles.header} ${className}`} {...rest}>{children}</div>;

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...rest
}) => <h3 className={`${styles.title} ${className}`} {...rest}>{children}</h3>;

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...rest
}) => <p className={`${styles.description} ${className}`} {...rest}>{children}</p>;

export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => <div className={`${styles.body} ${className}`} {...rest}>{children}</div>;

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => <div className={`${styles.footer} ${className}`} {...rest}>{children}</div>;

export const CardActions: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => <div className={`${styles.action} ${className}`} {...rest}>{children}</div>;

/* --------------------------------------------------------------------------
   Compound Export
   -------------------------------------------------------------------------- */
interface CardCompound extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Actions: typeof CardActions;
}

export const Card = CardRoot as CardCompound;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Actions = CardActions;
