import React from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Grid } from '@/ui';
import {
  PremiumPageHeader,
  SubscriptionPlanCard,
  PromoCodeCard,
  useGuildSubscription,
} from '@/features/subscription';

export const GuildPremiumPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const subscription = useGuildSubscription(guildId);

  return (
    <Stack gap="xl">
      <PremiumPageHeader guildId={guildId} />

      <Grid minItemWidth="md" gap="lg">
        {/* Current Plan Status */}
        <SubscriptionPlanCard entitlements={subscription.entitlements} />

        {/* Promo Code Redemption */}
        <PromoCodeCard subscription={subscription} />
      </Grid>
    </Stack>
  );
};
