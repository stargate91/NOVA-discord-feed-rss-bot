import React, { useState, useCallback, useMemo } from 'react';
import { AnnouncerContext } from './context';
import styles from './ScreenReaderAnnouncer.module.css';

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
        className={styles.srOnly}
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
};
