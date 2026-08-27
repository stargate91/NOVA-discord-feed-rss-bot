import type { MouseEvent } from 'react';
import React from 'react';
import type { DropdownTriggerProps } from './types';
import { useDropdown } from './context';

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({ children }) => {
  const { isOpen, toggle } = useDropdown();

  return React.cloneElement(children, {
    onClick: (e: MouseEvent) => {
      children.props.onClick?.(e);
      toggle();
    },
    'aria-expanded': isOpen ? 'true' : 'false',
    'aria-haspopup': 'true',
  });
};
