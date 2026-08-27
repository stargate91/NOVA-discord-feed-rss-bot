import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Ticket, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useToast } from '../../components/common/Toast';
import { Card, Button, Input, Badge, Field, Alert, Stack, Inline, Grid, Text } from '../../ui';

export const GuildPremiumPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const [promoCode, setPromoCode] = useState<string>('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.warning(t('guild.toastPromoRequired'), t('guild.toastPromoRequiredTitle'));
      return;
    }

    if (
      promoCode.trim().toLowerCase() === 'nova2026' ||
      promoCode.trim().toLowerCase() === 'launch'
    ) {
      toast.success(t('guild.toastPromoSuccess'), t('guild.toastPromoSuccessTitle'));
      setPromoCode('');
    } else {
      toast.error(t('guild.toastPromoInvalid'), t('guild.toastPromoInvalidTitle'));
    }
  };

  const handleUpgradeCheckout = () => {
    toast.info(t('guild.toastCheckoutRedirect'), t('guild.toastCheckoutRedirectTitle'));
  };

  return (
    <Stack gap="xl">
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

      <Grid minItemWidth="md" gap="lg">
        {/* Current Plan Status */}
        <Card
          glow="blue"
          padding="xl"
          title={t('guild.currentSubscriptionTitle')}
          subtitle={t('guild.currentSubscriptionSubtitle')}
        >
          <Stack gap="lg">
            <Stack gap="xs">
              <Inline justify="between" align="center">
                <Text size="xs" color="secondary">
                  {t('guild.activeTierLabel')}
                </Text>
                <Badge variant="tier">
                  <Sparkles size={12} /> {t('guild.activeTierValue')}
                </Badge>
              </Inline>
              <Inline justify="between" align="center">
                <Text size="xs" color="secondary">
                  {t('guild.maxActiveMonitors')}
                </Text>
                <Text size="xs" weight="semibold">
                  {t('guild.maxActiveMonitorsCount', { count: 25 })}
                </Text>
              </Inline>
              <Inline justify="between" align="center">
                <Text size="xs" color="secondary">
                  {t('guild.refreshIntervalLabel')}
                </Text>
                <Text size="xs" weight="semibold">
                  {t('guild.refreshIntervalValue', { seconds: 120 })}
                </Text>
              </Inline>
              <Inline justify="between" align="center">
                <Text size="xs" color="secondary">
                  {t('guild.priorityQueueDelivery')}
                </Text>
                <Inline gap="2xs" align="center">
                  <CheckCircle2 size={14} color="var(--status-success)" />
                  <Text size="xs" weight="semibold">
                    {t('guild.enabled')}
                  </Text>
                </Inline>
              </Inline>
            </Stack>

            <Button variant="primary" size="lg" fullWidth onClick={handleUpgradeCheckout}>
              <ArrowUpRight size={16} /> {t('guild.upgradeToMasterTierBtn')}
            </Button>
          </Stack>
        </Card>

        {/* Promo Code Redemption */}
        <Card
          glow="purple"
          padding="xl"
          title={t('guild.redeemPromoTitle')}
          subtitle={t('guild.redeemPromoSubtitle')}
        >
          <Stack gap="lg">
            <form onSubmit={handleApplyPromo}>
              <Stack gap="md">
                <Field label={t('guild.promoCodeInputLabel')} hint={t('guild.promoCodeHint')}>
                  <Input
                    leftIcon={<Ticket size={15} />}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('guild.promoCodePlaceholder')}
                    clearable
                  />
                </Field>

                <Button type="submit" variant="secondary" size="lg" fullWidth>
                  {t('guild.applyPromoBtn')}
                </Button>
              </Stack>
            </form>

            <Alert
              variant="info"
              title={t('guild.partnershipBenefitsTitle')}
              description={t('guild.partnershipBenefitsDesc')}
            />
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
};
