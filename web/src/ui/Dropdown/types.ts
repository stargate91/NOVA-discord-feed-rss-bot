import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  MouseEvent,
} from 'react';

export interface DropdownContextValue {
  isOpen: boolean;
  align: 'start' | 'end';
  placement: 'bottom' | 'top';
  close: () => void;
  toggle: () => void;
}

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
  placement?: 'bottom' | 'top';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

export interface DropdownTriggerProps {
  children: React.ReactElement;
}

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
}

export interface DropdownSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string;
  defaultValue?: string;
  onClear?: () => void;
  clearable?: boolean;
  className?: string;
}

export interface DropdownItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> {
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  shortcut?: string;
  closeOnClick?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
}

export interface DropdownHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface DropdownEmptyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
