import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Button, Chip, Stack, Inline, Text } from '@/ui';
import { OVERVIEW_PLATFORMS } from '../constants';

interface MonitoredPlatformsCardProps {
  guildId: string;
}

export const MonitoredPlatformsCard: React.FC<MonitoredPlatformsCardProps> = ({ guildId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card
      title={t('guild.monitoredPlatformsTitle')}
      subtitle={t('guild.monitoredPlatformsSubtitle')}
    >
      <Stack gap="md">
        <Inline gap="xs" wrap>
          {OVERVIEW_PLATFORMS.map((platform) => (
            <Chip
              key={platform.id}
              label={t(platform.labelKey)}
              icon={platform.icon}
              selected={platform.selected}
            />
          ))}
        </Inline>
        <Text size="xs" color="secondary">
          {t('guild.monitoredPlatformsDesc')}
        </Text>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate(`/dashboard/${guildId}/feeds`)}
        >
          <Sliders size={14} /> {t('guild.configureChannelsBtn')}
        </Button>
      </Stack>
    </Card>
  );
};
