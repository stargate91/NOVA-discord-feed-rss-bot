import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Button, Card, Chip, DiscordEmbed } from '../../ui';
import styles from '../LandingPage.module.css';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <SEO
        title={t('home.heroTitle')}
        description={t('home.heroDescription')}
      />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} color="var(--blue-400)" /> {t('home.heroTag')}
        </div>

        <h1 className={styles.heroTitle}>
          {t('home.heroTitle')}{' '}
          <span className={styles.heroGradient}>
            {t('home.heroTitleHighlight')}
          </span>
        </h1>

        <p className={styles.heroSubtitle}>
          {t('home.heroDescription')}
        </p>

        <div className={styles.heroActions}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=1489908793780338688&permissions=277025508352&scope=bot%20applications.commands', '_blank')}
          >
            {t('home.ctaDiscord')}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/servers')}
          >
            {t('home.ctaDashboard')}
          </Button>
        </div>
      </section>

      {/* Brand Supported Carousel */}
      <div className={styles.brandCarousel}>
        <Chip label="YouTube" icon="/images/brands/youtube.png" />
        <Chip label="Twitch" icon="/images/brands/twitch.png" />
        <Chip label="Kick" icon="/images/brands/kick.png" />
        <Chip label="Epic Games" icon="/images/brands/epic_games.png" />
        <Chip label="Steam" icon="/images/brands/steam.png" />
        <Chip label="GOG Free" icon="/images/brands/gog.png" />
        <Chip label="TMDB Movies" icon="/images/brands/tmdb.png" />
        <Chip label="GitHub Releases" icon="/images/brands/github.png" />
        <Chip label="Custom RSS" icon="/images/brands/rss.png" />
      </div>

      {/* Live Preview Demonstration */}
      <DiscordEmbed
        botName={t('home.embedBotName')}
        avatarUrl="/images/logo.webp"
        timestamp={t('home.embedTimestamp')}
        title={t('home.embedTitle')}
        description={t('home.embedDescription')}
        footerText={t('home.embedFooter')}
      />

      {/* Features Grid */}
      <div className={styles.featureGrid}>
        <Card
          title={t('home.featureRealtimeTitle')}
          subtitle={t('home.featureRealtimeSubtitle')}
          action={<Zap size={18} color="var(--blue-400)" />}
        >
          <p className={styles.cardText}>
            {t('home.featureRealtimeDesc')}
          </p>
        </Card>

        <Card
          title={t('home.featureReliabilityTitle')}
          subtitle={t('home.featureReliabilitySubtitle')}
          action={<ShieldCheck size={18} color="var(--status-success)" />}
        >
          <p className={styles.cardText}>
            {t('home.featureReliabilityDesc')}
          </p>
        </Card>

        <Card
          title={t('home.featureLayoutsTitle')}
          subtitle={t('home.featureLayoutsSubtitle')}
          action={<SlidersHorizontal size={18} color="var(--accent-cyan)" />}
        >
          <p className={styles.cardText}>
            {t('home.featureLayoutsDesc')}
          </p>
        </Card>
      </div>
    </div>
  );
};
