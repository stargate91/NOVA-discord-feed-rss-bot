import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import styles from './PageLoader.module.css';

export const PageLoader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.loaderWrapper} role="status" aria-label="Loading page content">
      <div className={styles.spinnerCircle} />
      <span className={styles.text}>{t('common.checking')}</span>
    </div>
  );
};
