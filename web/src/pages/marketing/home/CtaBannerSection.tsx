import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { DISCORD_BOT_INVITE_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { Card, Inline, Stack, Text, Button } from '@/ui';

export const CtaBannerSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card glow="blue" padding="xl">
      <Inline justify="between" align="center" wrap gap="2xl">
        <Stack gap="3xs">
          <Text as="h3" size="xl" weight="bold">
            {t('home.ctaSuperpowerTitle')}
          </Text>
          <Text size="sm" color="secondary">
            {t('home.ctaSuperpowerDesc')}
          </Text>
        </Stack>

        <Inline gap="md" wrap>
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
        </Inline>
      </Inline>
    </Card>
  );
};
