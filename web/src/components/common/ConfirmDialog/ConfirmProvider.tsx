import type { ReactNode } from 'react';
import React, { useState, useCallback, useMemo } from 'react';
import type { ConfirmOptions, ConfirmContextValue } from './types';
import { ConfirmContext } from './context';
import { ConfirmDialog } from './ConfirmDialog';

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const openModal = useCallback((content: ReactNode) => {
    setModalContent(content);
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
    if (confirmState) {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  }, [confirmState]);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const handleConfirmResolve = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const value: ConfirmContextValue = useMemo(
    () => ({
      openModal,
      closeModal,
      confirm,
    }),
    [openModal, closeModal, confirm]
  );

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {modalContent}
      {confirmState && (
        <ConfirmDialog
          {...confirmState.options}
          onConfirm={() => handleConfirmResolve(true)}
          onCancel={() => handleConfirmResolve(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
};

// Backwards compatibility alias
export const ModalProvider = ConfirmProvider;
