import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Stack, Inline, Text, Button } from '@/ui';

interface OverviewPageHeaderProps {
  guildId: string;
}

export const OverviewPageHeader: React.FC<OverviewPageHeaderProps> = ({ guildId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Inline justify="between" align="center" wrap gap="md">
      <Stack gap="3xs">
        <Text as="h2" size="lg" weight="bold">
          {t('guild.overviewTitle')}
        </Text>
        <Text size="xs" color="secondary">
          {t('guild.overviewSubtitle', { guildId })}
        </Text>
      </Stack>

      <Inline gap="xs" wrap>
        <Button variant="secondary" onClick={() => navigate('/servers')}>
          <ArrowLeftRight size={14} /> {t('guild.switchServerBtn')}
        </Button>
        <Button variant="primary" onClick={() => navigate(`/dashboard/${guildId}/feeds`)}>
          <Plus size={14} /> {t('guild.manageFeedsBtn')}
        </Button>
      </Inline>
    </Inline>
  );
};
