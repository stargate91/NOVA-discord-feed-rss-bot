import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Card } from '../../ui';
import styles from './MarketingPage.module.css';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <SEO
        title={t('legal.privacyTitle')}
        description={t('legal.privacySubtitle')}
      />

      <header className={styles.header}>
        <div className={styles.tag}>
          <Shield size={14} />
          <span>{t('legal.privacyTag')}</span>
        </div>
        <h1 className={styles.title}>
          {t('legal.privacyTitle')} <span>{t('legal.privacyTitleHighlight')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('legal.privacySubtitle')}
        </p>
      </header>

      <div className={styles.sectionStack}>
        <Card title={t('legal.privacySection1Title')}>
          <div className={styles.proseBlock}>
            <p>{t('legal.privacySection1Desc')}</p>
            <ul>
              <li><strong>{t('legal.privacyGuildInfo')}</strong></li>
              <li><strong>{t('legal.privacyFeedInfo')}</strong></li>
              <li><strong>{t('legal.privacyMetadataInfo')}</strong></li>
            </ul>
          </div>
        </Card>

        <Card title={t('legal.privacySection2Title')}>
          <div className={styles.proseBlock}>
            <p>{t('legal.privacySection2Desc')}</p>
          </div>
        </Card>

        <Card title={t('legal.privacySection3Title')}>
          <div className={styles.proseBlock}>
            <p>{t('legal.privacySection3Desc')}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
