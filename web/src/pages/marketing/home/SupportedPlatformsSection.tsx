import React from 'react';
import { useTranslation } from '@/i18n';
import { Text } from '@/ui';
import styles from './SupportedPlatformsSection.module.css';

const ROW_1 = [
  {
    id: 'youtube',
    nameKey: 'home.brandYoutube',
    badge: '4K & Shorts Alerts',
    icon: '/images/brands/youtube.png',
    brandColor: '#f87171',
    brandBadgeBg: 'rgb(239 68 68 / 12%)',
    brandBadgeBorder: 'rgb(239 68 68 / 25%)',
    brandBorder: 'rgb(239 68 68 / 50%)',
    brandGlow: '0 0 16px rgb(239 68 68 / 25%)',
  },
  {
    id: 'twitch',
    nameKey: 'home.brandTwitch',
    badge: '1-3s Live WebSocket',
    icon: '/images/brands/twitch.png',
    brandColor: '#c084fc',
    brandBadgeBg: 'rgb(145 70 255 / 12%)',
    brandBadgeBorder: 'rgb(145 70 255 / 25%)',
    brandBorder: 'rgb(145 70 255 / 50%)',
    brandGlow: '0 0 16px rgb(145 70 255 / 25%)',
  },
  {
    id: 'kick',
    nameKey: 'home.brandKick',
    badge: 'Real-Time Stream Alerts',
    icon: '/images/brands/kick.png',
    brandColor: '#53fc18',
    brandBadgeBg: 'rgb(83 252 24 / 12%)',
    brandBadgeBorder: 'rgb(83 252 24 / 25%)',
    brandBorder: 'rgb(83 252 24 / 50%)',
    brandGlow: '0 0 16px rgb(83 252 24 / 25%)',
  },
  {
    id: 'epic',
    nameKey: 'home.brandEpic',
    badge: 'Weekly Free Games',
    icon: '/images/brands/epic_games.png',
    brandColor: '#f1f5f9',
    brandBadgeBg: 'rgb(255 255 255 / 10%)',
    brandBadgeBorder: 'rgb(255 255 255 / 20%)',
    brandBorder: 'rgb(255 255 255 / 40%)',
    brandGlow: '0 0 16px rgb(255 255 255 / 20%)',
  },
  {
    id: 'steam',
    nameKey: 'home.brandSteam',
    badge: '100% Price Drops',
    icon: '/images/brands/steam.png',
    brandColor: '#66c0f4',
    brandBadgeBg: 'rgb(102 192 244 / 12%)',
    brandBadgeBorder: 'rgb(102 192 244 / 25%)',
    brandBorder: 'rgb(102 192 244 / 50%)',
    brandGlow: '0 0 16px rgb(102 192 244 / 25%)',
  },
] as const;

const ROW_2 = [
  {
    id: 'gog',
    nameKey: 'home.brandGog',
    badge: 'Free DRM Giveaways',
    icon: '/images/brands/gog.png',
    brandColor: '#d8b4fe',
    brandBadgeBg: 'rgb(156 84 214 / 12%)',
    brandBadgeBorder: 'rgb(156 84 214 / 25%)',
    brandBorder: 'rgb(156 84 214 / 50%)',
    brandGlow: '0 0 16px rgb(156 84 214 / 25%)',
  },
  {
    id: 'tmdb',
    nameKey: 'home.brandTmdb',
    badge: 'Cinema & TV Drops',
    icon: '/images/brands/tmdb.png',
    brandColor: '#38bdf8',
    brandBadgeBg: 'rgb(1 180 228 / 12%)',
    brandBadgeBorder: 'rgb(1 180 228 / 25%)',
    brandBorder: 'rgb(1 180 228 / 50%)',
    brandGlow: '0 0 16px rgb(1 180 228 / 25%)',
  },
  {
    id: 'github',
    nameKey: 'home.brandGithub',
    badge: 'Tags, Commits & Releases',
    icon: '/images/brands/github.png',
    brandColor: '#f1f5f9',
    brandBadgeBg: 'rgb(240 246 252 / 10%)',
    brandBadgeBorder: 'rgb(240 246 252 / 20%)',
    brandBorder: 'rgb(240 246 252 / 40%)',
    brandGlow: '0 0 16px rgb(240 246 252 / 20%)',
  },
  {
    id: 'rss',
    nameKey: 'home.brandRss',
    badge: 'Custom XML / Atom',
    icon: '/images/brands/rss.png',
    brandColor: '#fbbf24',
    brandBadgeBg: 'rgb(245 176 0 / 12%)',
    brandBadgeBorder: 'rgb(245 176 0 / 25%)',
    brandBorder: 'rgb(245 176 0 / 50%)',
    brandGlow: '0 0 16px rgb(245 176 0 / 25%)',
  },
  {
    id: 'discord',
    nameKey: 'common.brandName',
    badge: 'Sub-Second Webhooks',
    icon: '/images/logo.webp',
    brandColor: '#38bdf8',
    brandBadgeBg: 'rgb(56 189 248 / 12%)',
    brandBadgeBorder: 'rgb(56 189 248 / 25%)',
    brandBorder: 'rgb(56 189 248 / 50%)',
    brandGlow: '0 0 16px rgb(56 189 248 / 25%)',
  },
] as const;

// Duplicated for seamless infinite continuous scroll
const MARQUEE_ROW_1 = [...ROW_1, ...ROW_1, ...ROW_1];
const MARQUEE_ROW_2 = [...ROW_2, ...ROW_2, ...ROW_2];

export const SupportedPlatformsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Text as="h2" size="2xl" weight="bold" align="center" className={styles.title}>
          {t('home.supportedPlatformsTitle')}
        </Text>
        <Text size="sm" color="secondary" align="center" className={styles.subtitle}>
          {t('home.supportedPlatformsSubtitle')}
        </Text>
      </div>

      <div className={styles.marqueeWrapper}>
        {/* Row 1: Leftward infinite track */}
        <div className={`${styles.marqueeTrack} ${styles.marqueeLeft}`}>
          {MARQUEE_ROW_1.map((item, index) => (
            <div
              key={`${item.id}-r1-${index}`}
              className={styles.platformCard}
              data-platform={item.id}
            >
              <img src={item.icon} alt={t(item.nameKey)} className={styles.platformIcon} />
              <span className={styles.platformName}>{t(item.nameKey)}</span>
              <span className={styles.platformBadge}>{item.badge}</span>
            </div>
          ))}
        </div>

        {/* Row 2: Rightward infinite track */}
        <div className={`${styles.marqueeTrack} ${styles.marqueeRight}`}>
          {MARQUEE_ROW_2.map((item, index) => (
            <div
              key={`${item.id}-r2-${index}`}
              className={styles.platformCard}
              data-platform={item.id}
            >
              <img src={item.icon} alt={t(item.nameKey)} className={styles.platformIcon} />
              <span className={styles.platformName}>{t(item.nameKey)}</span>
              <span className={styles.platformBadge}>{item.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
