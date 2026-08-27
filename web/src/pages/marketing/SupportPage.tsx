import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Card, Button } from '../../ui';
import styles from './MarketingPage.module.css';

export const SupportPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <SEO
        title={t('support.tag')}
        description={t('support.subtitle')}
      />

      <header className={styles.header}>
        <div className={styles.tag}>
          <HelpCircle size={14} />
          <span>{t('support.tag')}</span>
        </div>
        <h1 className={styles.title}>
          {t('support.title')} <span>{t('support.titleHighlight')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('support.subtitle')}
        </p>
      </header>

      {/* Direct Discord Support Card */}
      <Card title={t('support.discordTitle')} subtitle={t('support.discordSubtitle')}>
        <div className={styles.proseBlock}>
          <p>{t('support.discordDesc')}</p>
          <div className={styles.ctaWrapper}>
            <Button
              variant="discord"
              size="lg"
              onClick={() => window.open('https://discord.gg/PbvX3S7pXR', '_blank')}
            >
              {t('support.discordCta')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Common Troubleshooting FAQ */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>
          {t('support.faqTitle')}
        </h2>
        <div className={styles.sectionStack}>
          <Card title={t('support.faqStreamQ')}>
            <div className={styles.proseBlock}>
              <p>{t('support.faqStreamA')}</p>
            </div>
          </Card>

          <Card title={t('support.faqLanguageQ')}>
            <div className={styles.proseBlock}>
              <p>{t('support.faqLanguageA')}</p>
            </div>
          </Card>

          <Card title={t('support.faqRoleQ')}>
            <div className={styles.proseBlock}>
              <p>{t('support.faqRoleA')}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
