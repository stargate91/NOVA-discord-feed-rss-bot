import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'card' | 'glass' | 'bordered';

export interface AccordionContextValue {
  type: AccordionType;
  openValues: string[];
  toggleValue: (val: string) => void;
  variant: AccordionVariant;
}

export interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type?: AccordionType;
  variant?: AccordionVariant;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
