import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { DISCORD_BOT_INVITE_URL, DISCORD_SUPPORT_SERVER_URL } from '@/constants';
import { Button, Text } from '@/ui';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroGrid}>
        {/* Left Column: Heading, Description, 2 CTAs */}
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
              as="a"
              variant="primary"
              size="lg"
              href={DISCORD_BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Plus size={18} /> {t('home.ctaDiscord')}
            </Button>
            <Button
              as="a"
              variant="secondary"
              size="lg"
              href={DISCORD_SUPPORT_SERVER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare size={18} /> {t('home.ctaCommunity')}
            </Button>
          </div>
        </div>

        {/* Right Column: Prominent Bot Logo Card with Next-Gen Picture Fallback & Strict Dimensions */}
        <div className={styles.logoCol}>
          <div className={styles.logoCard}>
            <picture>
              <source type="image/avif" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
              <source type="image/webp" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
              <source type="image/jpeg" srcSet="/images/logo.jpg 1x, /images/logo.jpg 2x" />
              <img
                src="/images/logo.webp"
                srcSet="/images/logo.webp 1x, /images/logo.webp 2x"
                sizes="(max-width: 640px) 96px, 128px"
                alt="Nova Feeds — Next-Generation Discord Notification Bot Hero Avatar"
                width={128}
                height={128}
                decoding="async"
                fetchPriority="high"
                className={styles.logoImage}
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
};
