import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { DISCORD_BOT_INVITE_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { Button, Text } from '@/ui';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroGrid}>
        {/* Left Column: Heading, Description, 2 CTAs, and Platform Chips */}
        <div className={styles.contentCol}>
          <Text as="h1" size="hero" weight="extrabold" className={styles.heroTitle}>
            {t('home.heroTitle')}{' '}
            <span className={styles.heroHighlightGroup}>
              {t('home.heroTitleWith')}{' '}
              <Text as="span" color="gradient" size="hero" weight="extrabold">
                {t('home.heroTitleHighlight')}
              </Text>
            </span>
          </Text>

          <Text size="lg" color="secondary" className={styles.heroDescription}>
            {t('home.heroDescription')}
          </Text>

          <div className={styles.ctaGroup}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => openExternalUrl(DISCORD_BOT_INVITE_URL)}
            >
              <Plus size={18} /> {t('home.ctaDiscord')}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/servers')}>
              <LayoutDashboard size={18} /> {t('home.ctaDashboard')}
            </Button>
          </div>
        </div>

        {/* Right Column: Prominent Bot Logo Card */}
        <div className={styles.logoCol}>
          <div className={styles.logoCard}>
            <img src="/images/logo.webp" alt="Nova Feeds Logo" className={styles.logoImage} />
          </div>
        </div>
      </div>
    </section>
  );
};
