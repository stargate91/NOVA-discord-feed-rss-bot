import React, { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Stack, Text, SegmentedControl, DiscordEmbed } from '@/ui';
import type { PreviewPlatform } from './embedMocks';
import { PREVIEW_PLATFORMS, getEmbedMocks } from './embedMocks';

export const InteractiveEmbedPreview: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('youtube');

  const currentPlatform = selectedPlatform as PreviewPlatform;
  const embedData = getEmbedMocks(t);

  return (
    <Stack align="center" gap="xl">
      <Stack align="center" gap="2xs">
        <Text as="h2" size="2xl" weight="bold" align="center">
          {t('home.previewTitle')}
        </Text>
        <Text size="sm" color="secondary" align="center">
          {t('home.previewSubtitle')}
        </Text>
      </Stack>

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

      <DiscordEmbed
        channelName="feed-alerts"
        botName={t('home.embedBotName')}
        avatarUrl="/images/logo.webp"
        timestamp={embedData[currentPlatform].footer.timestamp}
        author={embedData[currentPlatform].author}
        title={embedData[currentPlatform].title}
        titleUrl={embedData[currentPlatform].titleUrl}
        description={embedData[currentPlatform].description}
        thumbnail={embedData[currentPlatform].thumbnail}
        image={embedData[currentPlatform].image}
        fields={embedData[currentPlatform].fields}
        footer={embedData[currentPlatform].footer}
      />
    </Stack>
  );
};
