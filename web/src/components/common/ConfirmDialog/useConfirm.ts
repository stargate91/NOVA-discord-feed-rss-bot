import { useContext } from 'react';
import { ConfirmContext } from './context';
import type { ConfirmContextValue } from './types';

export const useConfirmContext = (): ConfirmContextValue => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmContext / useModal must be used within a ConfirmProvider');
  }
  return context;
};

export const useConfirm = () => {
  const { confirm } = useConfirmContext();
  return confirm;
};

// Backwards compatibility alias
export const useModal = useConfirmContext;
