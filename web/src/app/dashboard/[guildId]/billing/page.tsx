"use client";

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Badge,
  Spinner,
  Stack,
} from '@/components/ui';
import { PricingSection } from '@/components/pricing';
import { useBilling } from '@/hooks/use_billing';
import { getTierBadgeProps } from '@/utils/tier_limits';
import styles from './billing.module.css';

function GuildBillingContent() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '';

  const {
    billingInterval,
    setBillingInterval,
    currentTier,
    isMaster,
    checkoutLoading,
    loading,
    handlePurchaseClick,
    getTierPrice,
    tiers,
  } = useBilling({ guildId });

  if (loading) {
    return (
      <Stack align="center" justify="center" gap="lg" className={styles['loading-stack']}>
        <Spinner size="lg" label="Loading subscription details..." />
      </Stack>
    );
  }

  const badgeProps = getTierBadgeProps({ tier: currentTier, isMaster });

  return (
    <div className={styles['billing-container']}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Server Subscription & Plans"
        description="Upgrade your feed delivery speed, increase monitor quotas, and unlock white-label branding."
        badge={
          <Badge
            variant={badgeProps.variant}
            size="sm"
            dot={badgeProps.dot}
            icon={badgeProps.isMaster ? <ShieldCheck size={12} /> : undefined}
          >
            {badgeProps.label}
          </Badge>
        }
      />

      {/* ── Shared Pricing Section ── */}
      <PricingSection
        billingInterval={billingInterval}
        onIntervalChange={setBillingInterval}
        currentTier={currentTier}
        isMaster={isMaster}
        checkoutLoading={checkoutLoading}
        onPurchaseClick={handlePurchaseClick}
        getTierPrice={getTierPrice}
        tiers={tiers}
        comparisonTitle="Full Tier Comparison"
        comparisonDescription="Detailed breakdown of features, rate limits, and management tools across all tiers."
      />
    </div>
  );
}

export default function GuildBillingPage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading..." />}>
      <GuildBillingContent />
    </Suspense>
  );
}
