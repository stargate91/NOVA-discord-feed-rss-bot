import type { ReactNode } from 'react';

export type ConfirmVariant = 'primary' | 'warning' | 'danger';

export interface ConfirmOptions {
  title?: ReactNode;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export interface ConfirmContextValue {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// Backwards compatibility alias
export type ModalContextValue = ConfirmContextValue;
