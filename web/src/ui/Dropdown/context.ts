import { createContext, useContext } from 'react';
import type { DropdownContextValue } from './types';

export const DropdownContext = createContext<DropdownContextValue | null>(null);

export const useDropdown = (): DropdownContextValue => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown subcomponents must be used within a <Dropdown>');
  }
  return context;
};
