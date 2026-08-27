import React from 'react';
import type { TabPanelProps } from './types';
import { useTabs } from './context';
import styles from './Tabs.module.css';

export const TabPanel: React.FC<TabPanelProps> = ({ value, children, className = '', ...rest }) => {
  const { activeTab, keepMounted } = useTabs();
  const isSelected = activeTab === value;

  if (!isSelected && !keepMounted) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      hidden={!isSelected}
      className={`${styles.panel} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
