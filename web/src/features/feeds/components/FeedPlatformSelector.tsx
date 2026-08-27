import React from 'react';
import { useTranslation } from '@/i18n';
import { Stack, Inline, Text, Chip } from '@/ui';
import { FEED_PLATFORMS } from '../constants';

interface FeedPlatformSelectorProps {
  selected: string;
  onSelect: (platformId: string) => void;
}

export const FeedPlatformSelector: React.FC<FeedPlatformSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <Stack gap="xs">
      <Text size="xs" color="secondary">
        {t('guild.supportedIntegrations')}
      </Text>
      <Inline gap="xs" wrap>
        {FEED_PLATFORMS.map((platform) => (
          <Chip
            key={platform.id}
            label={t(platform.labelKey)}
            icon={platform.icon}
            selected={selected === platform.id}
            onClick={() => onSelect(platform.id)}
          />
        ))}
      </Inline>
    </Stack>
  );
};
