import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ConfirmOptions, ModalContextValue } from './types';
import { ModalContext } from './context';
import { ConfirmDialog } from './ConfirmDialog';

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
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

  // Handle ESC key press and scroll locking
  useEffect(() => {
    const isAnyModalOpen = modalContent !== null || confirmState !== null;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    document.body.style.overflow = '';
  }, [modalContent, confirmState, closeModal]);

  const handleConfirmResolve = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const value: ModalContextValue = useMemo(
    () => ({
      openModal,
      closeModal,
      confirm,
    }),
    [openModal, closeModal, confirm]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalContent}
      {confirmState && (
        <ConfirmDialog
          {...confirmState.options}
          onConfirm={() => handleConfirmResolve(true)}
          onCancel={() => handleConfirmResolve(false)}
        />
      )}
    </ModalContext.Provider>
  );
};
