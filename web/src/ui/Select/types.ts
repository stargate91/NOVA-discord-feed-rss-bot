import type { ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'filled' | 'glass';
export type SelectStatus = 'default' | 'error' | 'warning' | 'success';

export interface SelectChangeEvent {
  target: {
    value: string;
    name?: string;
  };
}

export interface SelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  options?: SelectOption[];
  onChange?: (e: SelectChangeEvent) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: ReactNode;
  error?: ReactNode;
  status?: SelectStatus;
  leftIcon?: ReactNode;
  size?: SelectSize;
  variant?: SelectVariant;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  children?: ReactNode;
  className?: string;
  id?: string;
}
