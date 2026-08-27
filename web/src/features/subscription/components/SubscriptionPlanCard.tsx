import React from 'react';
import { Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import { Card, Button, Badge, Stack, Inline, Text } from '@/ui';
import type { GuildEntitlements } from '../types';
import styles from './SubscriptionPlanCard.module.css';

interface SubscriptionPlanCardProps {
  entitlements: GuildEntitlements;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({ entitlements }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const isMaster = entitlements.tier === 'master';

  const handleUpgradeCheckout = () => {
    toast.info(t('guild.toastCheckoutRedirect'), t('guild.toastCheckoutRedirectTitle'));
  };

  return (
    <Card
      glow={isMaster ? 'purple' : 'blue'}
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
              <Sparkles size={12} />{' '}
              {entitlements.tier_name || (isMaster ? 'Nova Master' : t('guild.activeTierValue'))}
            </Badge>
          </Inline>
          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('guild.maxActiveMonitors')}
            </Text>
            <Text size="xs" weight="semibold">
              {isMaster || entitlements.max_monitors >= 9999
                ? t('guild.unlimitedMonitors')
                : t('guild.maxActiveMonitorsCount', { count: entitlements.max_monitors })}
            </Text>
          </Inline>
          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('guild.refreshIntervalLabel')}
            </Text>
            <Text size="xs" weight="semibold">
              {isMaster || entitlements.min_poll_interval_seconds <= 0
                ? t('guild.instantPolling')
                : t('guild.refreshIntervalValue', {
                    seconds: entitlements.min_poll_interval_seconds,
                  })}
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

        {isMaster ? (
          <Button variant="glass" size="lg" fullWidth disabled className={styles.disabledMasterBtn}>
            <Sparkles size={16} /> {t('guild.masterActiveBtn')}
          </Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={handleUpgradeCheckout}>
            <ArrowUpRight size={16} /> {t('guild.upgradeToUltimateTierBtn')}
          </Button>
        )}
      </Stack>
    </Card>
  );
};
