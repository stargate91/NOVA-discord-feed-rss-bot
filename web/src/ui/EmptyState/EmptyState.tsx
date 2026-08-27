import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './EmptyState.module.css';

export type EmptyStateVariant = 'default' | 'card' | 'glass' | 'dashed';
export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
  children,
  className = '',
  id,
  ...rest
}) => {
  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const variantClass =
    {
      default: styles.variantDefault,
      card: styles.variantCard,
      glass: styles.variantGlass,
      dashed: styles.variantDashed,
    }[variant] || styles.variantDefault;

  const classes = [styles.container, sizeClass, variantClass, className].filter(Boolean).join(' ');

  return (
    <div id={id} className={classes} {...rest}>
      {icon && <div className={styles.iconWrapper}>{icon}</div>}

      {typeof title === 'string' ? <h3 className={styles.title}>{title}</h3> : title}

      {description &&
        (typeof description === 'string' ? (
          <p className={styles.description}>{description}</p>
        ) : (
          description
        ))}

      {children}

      {(action || secondaryAction) && (
        <div className={styles.actions}>
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
