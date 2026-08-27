import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface AnnouncerContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export interface AnnouncerProviderProps {
  children: React.ReactNode;
}

/**
 * ScreenReaderAnnouncer ensures screen readers reliably receive dynamic status updates,
 * alerts, and asynchronous operation results using standard ARIA live regions.
 */
export const AnnouncerProvider: React.FC<AnnouncerProviderProps> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState<string>('');
  const [assertiveMessage, setAssertiveMessage] = useState<string>('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      {/* Invisible screen reader live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
};

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
