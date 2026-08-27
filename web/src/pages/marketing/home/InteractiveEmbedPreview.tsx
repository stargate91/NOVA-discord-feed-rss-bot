import React, { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Text, SegmentedControl, DiscordEmbed } from '@/ui';
import type { PreviewPlatform } from './embedMocks';
import { PREVIEW_PLATFORMS, getEmbedMocks } from './embedMocks';
import styles from './InteractiveEmbedPreview.module.css';

export const InteractiveEmbedPreview: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('youtube');

  const currentPlatform = selectedPlatform as PreviewPlatform;
  const embedData = getEmbedMocks(t);

  return (
    <section className={styles.previewSection}>
      <div className={styles.header}>
        <Text as="h2" size="2xl" weight="bold" align="center" className={styles.title}>
          {t('home.previewTitle')}
        </Text>
        <Text size="sm" color="secondary" align="center" className={styles.subtitle}>
          {t('home.previewSubtitle')}
        </Text>
      </div>

      <div className={styles.controlWrapper}>
        <SegmentedControl
          size="md"
          value={selectedPlatform}
          onChange={setSelectedPlatform}
          options={PREVIEW_PLATFORMS.map((p) => {
            const IconComponent = p.icon;
            return {
              value: p.value,
              label: t(p.labelKey),
              icon: <IconComponent size={15} />,
            };
          })}
        />
      </div>

      <div className={styles.embedWrapper}>
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
