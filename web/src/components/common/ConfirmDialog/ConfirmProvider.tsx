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
    setConfirmState((prev) => {
      if (prev) {
        prev.resolve(false);
      }
      return null;
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const handleConfirmResolve = useCallback((value: boolean) => {
    setConfirmState((prev) => {
      if (prev) {
        prev.resolve(value);
      }
      return null;
    });
  }, []);

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
