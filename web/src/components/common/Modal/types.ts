import type { ReactNode } from 'react';

export type ConfirmVariant = 'danger' | 'warning' | 'primary';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export interface ModalContextValue {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}
