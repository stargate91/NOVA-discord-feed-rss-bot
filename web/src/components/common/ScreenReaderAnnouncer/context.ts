import { createContext } from 'react';

export interface AnnouncerContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

export const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);
