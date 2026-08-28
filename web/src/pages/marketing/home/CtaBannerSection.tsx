import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { DISCORD_BOT_INVITE_URL, DISCORD_SUPPORT_SERVER_URL } from '@/constants';
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
            as="a"
            variant="primary"
            size="lg"
            href={DISCORD_BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Plus size={18} /> {t('home.ctaDiscord')}
          </Button>
          <Button
            as="a"
            variant="secondary"
            size="lg"
            href={DISCORD_SUPPORT_SERVER_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare size={18} /> {t('home.ctaCommunity')}
          </Button>
        </Inline>
      </Inline>
    </Card>
  );
};
