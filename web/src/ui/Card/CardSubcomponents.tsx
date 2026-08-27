import type { HTMLAttributes } from 'react';
import React from 'react';
import type { CardHeaderProps, CardFooterProps } from './types';
import styles from './Card.module.css';

export const CardHeader: React.FC<CardHeaderProps> = ({
  divided = false,
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.header} ${divided ? styles.headerDivided : ''} ${className}`} {...rest}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <h3 className={`${styles.title} ${className}`} {...rest}>
    {children}
  </h3>
);

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <p className={`${styles.description} ${className}`} {...rest}>
    {children}
  </p>
);

export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.body} ${className}`} {...rest}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({
  divided = true,
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.footer} ${divided ? styles.footerDivided : ''} ${className}`} {...rest}>
    {children}
  </div>
);

export const CardActions: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.action} ${className}`} {...rest}>
    {children}
  </div>
);
