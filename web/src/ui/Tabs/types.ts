import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export type TabsVariant = 'line' | 'pill' | 'card' | 'glass';
export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabsContextValue {
  activeTab: string;
  setActiveTab: (val: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  fitted: boolean;
  keepMounted: boolean;
}

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

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: ReactNode;
  badge?: ReactNode | number;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
  className?: string;
}
