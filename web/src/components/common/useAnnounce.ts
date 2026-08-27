import { useContext } from 'react';
import { AnnouncerContext } from './AnnouncerContext';
import type { AnnouncerContextValue } from './AnnouncerContext';

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
