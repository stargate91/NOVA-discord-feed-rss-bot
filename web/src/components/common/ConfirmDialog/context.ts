import { createContext } from 'react';
import type { ConfirmContextValue } from './types';

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// Backwards compatibility alias
export const ModalContext = ConfirmContext;
