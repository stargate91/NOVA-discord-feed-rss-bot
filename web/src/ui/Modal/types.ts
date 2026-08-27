import type { HTMLAttributes, ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalContextValue {
  onClose?: () => void;
}

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  portalTarget?: HTMLElement | null;
  children: ReactNode;
  className?: string;
  id?: string;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  children: ReactNode;
  className?: string;
}
