"use client";

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Badge,
  SegmentedControl,
  Spinner,
  Stack,
  Heading,
  Text,
} from '@/components/ui';
import { PricingCard, PremiumComparisonTable } from '@/components/pricing';
import { TIERS } from '@/constants/tiers';
import { useGuildBilling } from '@/hooks/use_guild_billing';
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
  } = useGuildBilling(guildId);

  if (loading) {
    return (
      <Stack align="center" justify="center" gap="lg" className={styles['loading-stack']}>
        <Spinner size="lg" label="Loading subscription details..." />
      </Stack>
    );
  }

  return (
    <div className={styles['billing-container']}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Server Subscription & Plans"
        description="Upgrade your feed delivery speed, increase monitor quotas, and unlock white-label branding."
        badge={
          isMaster ? (
            <Badge variant="master" size="sm" icon={<ShieldCheck size={12} />}>
              Master Tier
            </Badge>
          ) : currentTier > 0 ? (
            <Badge variant="warning" size="sm" dot>
              Tier {currentTier} Active
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Free Tier
            </Badge>
          )
        }
      />

      {/* ── Billing Interval Switcher ── */}
      <div className={styles['switcher-row']}>
        <SegmentedControl<'mo' | 'yr'>
          value={billingInterval}
          onChange={setBillingInterval}
          options={[
            { value: 'mo', label: 'Monthly Billing' },
            {
              value: 'yr',
              label: (
                <span className={styles['yearly-badge-wrapper']}>
                  <span>Yearly Billing</span>
                  <Badge variant="warning" size="sm">
                    SAVE 20%
                  </Badge>
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* ── Pricing Cards Grid ── */}
      <div className={styles['plans-grid']}>
        {TIERS.map((t) => (
          <PricingCard
            key={t.tier}
            tier={t.tier}
            currentTier={currentTier}
            isMaster={isMaster}
            title={t.title}
            description={t.description}
            price={billingInterval === 'mo' ? t.price.mo : t.price.yr}
            interval={billingInterval === 'mo' ? 'mo' : 'yr'}
            isPopular={t.isPopular}
            features={t.features}
            onPurchaseClick={() => handlePurchaseClick(t.tier)}
            isLoading={checkoutLoading === t.tier}
          />
        ))}
      </div>

      {/* ── Feature Comparison Table ── */}
      <div className={styles['comparison-wrapper']}>
        <Stack gap="md" align="center">
          <Heading level={2} size="2xl" weight="bold">
            Full Tier Comparison
          </Heading>
          <Text as="p" size="sm" variant="muted">
            Detailed breakdown of features, rate limits, and management tools across all tiers.
          </Text>
          <PremiumComparisonTable />
        </Stack>
      </div>
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
