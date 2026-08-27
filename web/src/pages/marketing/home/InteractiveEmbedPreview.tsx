import React, { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Text, DiscordEmbed } from '@/ui';
import type { PreviewPlatform } from './embedMocks';
import { PREVIEW_PLATFORMS, getEmbedMocks } from './embedMocks';
import styles from './InteractiveEmbedPreview.module.css';

export const InteractiveEmbedPreview: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlatform, setSelectedPlatform] = useState<PreviewPlatform>('youtube');

  const currentPlatform = selectedPlatform;
  const embedData = getEmbedMocks(t);

  return (
    <section className={styles.previewSection} aria-labelledby="live-preview-title">
      <div className={styles.header}>
        <Text as="h2" size="2xl" weight="bold" align="center" className={styles.title} id="live-preview-title">
          {t('home.previewTitle')}
        </Text>
        <Text size="sm" color="secondary" align="center" className={styles.subtitle}>
          {t('home.previewSubtitle')}
        </Text>
      </div>

      {/* 1-Row 1:1 Brand Card Selector above the embed */}
      <div className={styles.selectorWrapper}>
        <div
          className={styles.brandRow}
          role="tablist"
          aria-label={t('home.previewTitle')}
        >
          {PREVIEW_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.value;
            return (
              <button
                key={platform.value}
                type="button"
                role="tab"
                id={`tab-${platform.value}`}
                aria-selected={isSelected}
                aria-controls={`panel-${platform.value}`}
                title={t(platform.labelKey)}
                aria-label={t(platform.labelKey)}
                tabIndex={isSelected ? 0 : -1}
                className={`${styles.brandCard} ${isSelected ? styles.brandCardActive : ''}`}
                data-platform={platform.value}
                onClick={() => setSelectedPlatform(platform.value)}
                onKeyDown={(e) => {
                  const idx = PREVIEW_PLATFORMS.findIndex((p) => p.value === platform.value);
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = PREVIEW_PLATFORMS[(idx + 1) % PREVIEW_PLATFORMS.length];
                    setSelectedPlatform(next.value);
                    document.getElementById(`tab-${next.value}`)?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev =
                      PREVIEW_PLATFORMS[
                        (idx - 1 + PREVIEW_PLATFORMS.length) % PREVIEW_PLATFORMS.length
                      ];
                    setSelectedPlatform(prev.value);
                    document.getElementById(`tab-${prev.value}`)?.focus();
                  }
                }}
              >
                <img
                  src={platform.image}
                  alt={t(platform.labelKey)}
                  className={styles.brandImage}
                  width="36"
                  height="36"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Discord Embed with Ambient Glow */}
      <div
        id={`panel-${currentPlatform}`}
        role="tabpanel"
        aria-labelledby={`tab-${currentPlatform}`}
        className={styles.embedWrapper}
        data-platform={currentPlatform}
      >
        <div className={styles.ambientGlow} aria-hidden="true" />
        <DiscordEmbed
          channelName={embedData[currentPlatform].channelName}
          botName="Nova"
          avatarUrl="/images/logo.webp"
          timestamp={embedData[currentPlatform].footer.timestamp}
          roleMention={embedData[currentPlatform].roleMention}
          alertText={embedData[currentPlatform].alertText}
          alertUrl={embedData[currentPlatform].alertUrl}
          platformIcon={embedData[currentPlatform].platformIcon}
          accentColor={embedData[currentPlatform].accentColor}
          author={embedData[currentPlatform].author}
          title={embedData[currentPlatform].title}
          titleUrl={embedData[currentPlatform].titleUrl}
          description={embedData[currentPlatform].description}
          metaLines={embedData[currentPlatform].metaLines}
          thumbnail={embedData[currentPlatform].thumbnail}
          image={embedData[currentPlatform].image}
          fields={embedData[currentPlatform].fields}
          accessoryButton={embedData[currentPlatform].accessoryButton}
          buttons={embedData[currentPlatform].buttons}
          footerText={embedData[currentPlatform].footer.text}
        />
      </div>
    </section>
  );
};

