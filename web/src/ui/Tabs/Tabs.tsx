import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import styles from './Tabs.module.css';

export type TabsVariant = 'line' | 'pill' | 'card' | 'glass';
export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsOrientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (val: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  fitted: boolean;
  keepMounted: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs subcomponents must be used within a <Tabs>');
  }
  return context;
};

/* --------------------------------------------------------------------------
   Root Tabs Component
   -------------------------------------------------------------------------- */
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  fitted?: boolean;
  keepMounted?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

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

/* --------------------------------------------------------------------------
   Tabs.List
   -------------------------------------------------------------------------- */
export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '', ...rest }) => {
  const { variant, size, orientation, fitted } = useTabs();

  const variantClass = {
    line: styles.variantLine,
    pill: styles.variantPill,
    card: styles.variantCard,
    glass: styles.variantGlass,
  }[variant] || styles.variantLine;

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] || styles.sizeMd;

  const orientationClass = orientation === 'vertical' ? styles.verticalList : '';
  const fittedClass = fitted ? styles.fitted : '';

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={`${styles.list} ${variantClass} ${sizeClass} ${orientationClass} ${fittedClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Tabs.Tab / Tabs.Trigger
   -------------------------------------------------------------------------- */
export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: ReactNode;
  badge?: ReactNode | number;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

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

/* --------------------------------------------------------------------------
   Tabs.Panel / Tabs.Content
   -------------------------------------------------------------------------- */
export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className = '',
  ...rest
}) => {
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


/* --------------------------------------------------------------------------
   Compound Export
   -------------------------------------------------------------------------- */
interface TabsCompound extends React.FC<TabsProps> {
  List: typeof TabsList;
  Tab: typeof Tab;
  Trigger: typeof Tab;
  Panel: typeof TabPanel;
  Content: typeof TabPanel;
}

export const Tabs = TabsRoot as TabsCompound;
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Trigger = Tab;
Tabs.Panel = TabPanel;
Tabs.Content = TabPanel;
