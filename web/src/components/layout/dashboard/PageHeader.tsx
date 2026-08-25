import React from 'react';
import styles from './dashboard.module.css';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={[styles['page-header'], className].filter(Boolean).join(' ')}>
      <div className={styles['page-header-info']}>
        {breadcrumbs && <div>{breadcrumbs}</div>}
        <div className={styles['page-header-title-row']}>
          {typeof title === 'string' ? (
            <h1 className={styles['page-header-title']}>{title}</h1>
          ) : (
            title
          )}
          {badge && <div>{badge}</div>}
        </div>
        {description && (
          <p className={styles['page-header-desc']}>{description}</p>
        )}
      </div>

      {actions && <div className={styles['page-header-actions']}>{actions}</div>}
    </div>
  );
}
