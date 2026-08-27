import React from 'react';
import { useTranslation } from '@/i18n';
import { Stack, Inline, Text, Badge } from '@/ui';

interface PremiumPageHeaderProps {
  guildId: string;
}

export const PremiumPageHeader: React.FC<PremiumPageHeaderProps> = ({ guildId }) => {
  const { t } = useTranslation();

  return (
    <Inline justify="between" align="center" wrap gap="md">
      <Stack gap="3xs">
        <Text as="h2" size="lg" weight="bold">
          {t('guild.premiumTitle')}
        </Text>
        <Text size="xs" color="secondary">
          {t('guild.premiumSubtitle', { guildId })}
        </Text>
      </Stack>

      <Badge variant="online" dot pulse>
        {t('guild.activePlanBadge')}
      </Badge>
    </Inline>
  );
};
