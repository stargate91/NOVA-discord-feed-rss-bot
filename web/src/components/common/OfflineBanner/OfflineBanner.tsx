import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../../../hooks';
import styles from './OfflineBanner.module.css';

export const OfflineBanner: React.FC = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className={`${styles.banner} ${styles.offline}`} role="alert" aria-live="assertive">
        <span className={styles.icon}>
          <WifiOff size={14} />
        </span>
        <span>Network connection lost. Offline changes will be synced once connection is restored.</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className={`${styles.banner} ${styles.restored}`} role="status" aria-live="polite">
        <span className={styles.icon}>
          <Wifi size={14} />
        </span>
        <span>Connection restored! Telemetry synchronization active.</span>
      </div>
    );
  }

  return null;
};
