import React from 'react';

/**
 * Unified SelectOption interface supporting both { value, label } and { id, name } conventions.
 */
export interface SelectOption<T = string> {
  value?: T;
  label?: React.ReactNode;
  id?: string;
  name?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  [key: string]: any;
}
