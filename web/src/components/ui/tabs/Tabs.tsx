"use client";

import React, { createContext, useContext, useState } from 'react';
import styles from './tabs.module.css';

export type TabsVariant = 'pills' | 'underline';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'pills',
  children,
  className,
  ...props
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (tabId: string) => {
    if (value === undefined) setInternalTab(tabId);
    onValueChange?.(tabId);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div
        className={[styles['tabs-root'], className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = useContext(TabsContext);
  const variantClass = styles[`list-${context?.variant || 'pills'}`];

  return (
    <div
      role="tablist"
      className={[styles['tab-list'], variantClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function TabTrigger({
  value,
  icon,
  badge,
  children,
  className,
  disabled,
  ...props
}: TabTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used within <Tabs>');

  const isActive = context.activeTab === value;
  const variantClass = styles[`trigger-${context.variant}`];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={[
        styles['tab-trigger'],
        variantClass,
        isActive && styles.active,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => context.setActiveTab(value)}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {badge && <span>{badge}</span>}
    </button>
  );
}

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabContent({
  value,
  children,
  className,
  ...props
}: TabContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within <Tabs>');

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={[styles['tab-content'], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
