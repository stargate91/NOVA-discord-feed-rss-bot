import React from 'react';
import type { TabProps } from './types';
import { useTabs } from './context';
import styles from './Tabs.module.css';

export const Tab: React.FC<TabProps> = ({
  value,
  icon,
  badge,
  disabled = false,
  children,
  className = '',
  ...rest
}) => {
  const { activeTab, setActiveTab, fitted } = useTabs();
  const isSelected = activeTab === value;

  const classes = [
    styles.tab,
    isSelected ? styles.active : '',
    fitted ? styles.tabFitted : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      className={classes}
      onClick={() => setActiveTab(value)}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && <span className={styles.badge}>{badge}</span>}
    </button>
  );
};
