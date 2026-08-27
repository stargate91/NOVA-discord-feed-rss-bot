import React from 'react';
import { Scale } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Card } from '../../ui';
import styles from './MarketingPage.module.css';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <SEO
        title={t('legal.termsTitle')}
        description={t('legal.termsSubtitle')}
      />

      <header className={styles.header}>
        <div className={styles.tag}>
          <Scale size={14} />
          <span>{t('legal.termsTag')}</span>
        </div>
        <h1 className={styles.title}>
          {t('legal.termsTitle')} <span>{t('legal.termsTitleHighlight')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('legal.termsSubtitle')}
        </p>
      </header>

      <div className={styles.sectionStack}>
        <Card title={t('legal.termsSection1Title')}>
          <div className={styles.proseBlock}>
            <p>{t('legal.termsSection1Desc')}</p>
          </div>
        </Card>

        <Card title={t('legal.termsSection2Title')}>
          <div className={styles.proseBlock}>
            <p>{t('legal.termsSection2Desc')}</p>
          </div>
        </Card>

        <Card title={t('legal.termsSection3Title')}>
          <div className={styles.proseBlock}>
            <p>{t('legal.termsSection3Desc')}</p>
          </div>
        </Card>

        <Card title={t('legal.termsSection4Title')}>
          <div className={styles.proseBlock}>
            <p>{t('legal.termsSection4Desc')}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
