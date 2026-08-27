import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Button, Badge, Card } from '../../ui';
import styles from './MarketingPage.module.css';

export const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <SEO
        title={t('premium.tag')}
        description={t('premium.subtitle')}
      />

      <header className={styles.header}>
        <div className={styles.tag}>
          <Sparkles size={14} />
          <span>{t('premium.tag')}</span>
        </div>
        <h1 className={styles.title}>
          {t('premium.title')} <span>{t('premium.titleHighlight')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('premium.subtitle')}
        </p>
      </header>

      {/* Pricing Grid */}
      <div className={styles.grid3}>
        {/* Free Plan */}
        <div className={styles.priceCard}>
          <Badge variant="neutral">{t('premium.freeTitle')}</Badge>
          <div className={styles.priceValue}>
            {t('premium.freePrice')} <span>{t('premium.freePricePeriod')}</span>
          </div>
          <p className={styles.proseBlock}>{t('premium.freeDesc')}</p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.freeFeature1')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.freeFeature2')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.freeFeature3')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.freeFeature4')}</li>
          </ul>
          <Button variant="secondary" fullWidth onClick={() => navigate('/servers')}>
            {t('premium.freeCta')}
          </Button>
        </div>

        {/* Plus Plan (Featured) */}
        <div className={`${styles.priceCard} ${styles.featuredCard}`}>
          <div className={styles.tierBadge}>
            <Badge variant="tier">{t('premium.plusBadge')}</Badge>
          </div>
          <Badge variant="online">{t('premium.plusTitle')}</Badge>
          <div className={styles.priceValue}>
            {t('premium.plusPrice')} <span>{t('premium.plusPricePeriod')}</span>
          </div>
          <p className={styles.proseBlock}>{t('premium.plusDesc')}</p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.plusFeature1')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.plusFeature2')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.plusFeature3')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.plusFeature4')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.plusFeature5')}</li>
          </ul>
          <Button variant="primary" fullWidth onClick={() => navigate('/servers')}>
            {t('premium.plusCta')}
          </Button>
        </div>

        {/* Master Plan */}
        <div className={styles.priceCard}>
          <Badge variant="tier">{t('premium.masterTitle')}</Badge>
          <div className={styles.priceValue}>
            {t('premium.masterPrice')} <span>{t('premium.masterPricePeriod')}</span>
          </div>
          <p className={styles.proseBlock}>{t('premium.masterDesc')}</p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.masterFeature1')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.masterFeature2')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.masterFeature3')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.masterFeature4')}</li>
            <li className={styles.featureItem}><Check size={14} className={styles.checkIcon} /> {t('premium.masterFeature5')}</li>
          </ul>
          <Button variant="secondary" fullWidth onClick={() => navigate('/servers')}>
            {t('premium.masterCta')}
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>
          {t('premium.faqTitle')}
        </h2>
        <div className={styles.sectionStack}>
          <Card title={t('premium.faqQ1')}>
            <p className={styles.proseBlock}>
              {t('premium.faqA1')}
            </p>
          </Card>

          <Card title={t('premium.faqQ2')}>
            <p className={styles.proseBlock}>
              {t('premium.faqA2')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
