import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { DISCORD_BOT_INVITE_URL, DISCORD_SUPPORT_SERVER_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { Card, Inline, Stack, Text, Button } from '@/ui';

export const CtaBannerSection: React.FC = () => {
  const { t } = useTranslation();

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
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openExternalUrl(DISCORD_SUPPORT_SERVER_URL)}
          >
            <MessageSquare size={18} /> {t('home.ctaCommunity')}
          </Button>
        </Inline>
      </Inline>
    </Card>
  );
};
