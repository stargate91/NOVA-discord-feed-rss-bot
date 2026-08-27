import React, { useState } from 'react';
import type { TabsProps } from './types';
import { TabsContext } from './context';
import styles from './Tabs.module.css';

export const TabsRoot: React.FC<TabsProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  variant = 'line',
  size = 'md',
  orientation = 'horizontal',
  fitted = false,
  keepMounted = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;

  const handleTabChange = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onChange?.(val);
  };

  const orientationClass = orientation === 'vertical' ? styles.verticalTabs : '';

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab: handleTabChange,
        variant,
        size,
        orientation,
        fitted,
        keepMounted,
      }}
    >
      <div id={id} className={`${styles.tabs} ${orientationClass} ${className}`} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};
