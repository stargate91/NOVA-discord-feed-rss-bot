import { useContext } from 'react';
import { ModalContext } from './context';
import type { ModalContextValue } from './types';

export const useModal = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const useConfirm = () => {
  const { confirm } = useModal();
  return confirm;
};
