import { createContext, useContext } from 'react';
import type { ModalContextValue } from './types';

export const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = (): ModalContextValue | null => useContext(ModalContext);
