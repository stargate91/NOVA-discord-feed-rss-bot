import { useContext } from 'react';
import { AnnouncerContext } from './context';
import type { AnnouncerContextValue } from './context';

export const useAnnounce = (): AnnouncerContextValue => {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Graceful fallback for components rendered outside AnnouncerProvider
    return {
      announce: () => {},
    };
  }
  return context;
};
