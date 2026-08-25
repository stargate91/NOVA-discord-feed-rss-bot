"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sparkles, ShieldCheck } from 'lucide-react';
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
import billingService from '@/services/billing_service';
import settingsService from '@/services/settings_service';
import { useToast } from '@/context/toast_context';
import styles from './billing.module.css';

function GuildBillingContent() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '';
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [billingInterval, setBillingInterval] = useState<'mo' | 'yr'>('mo');
  const [currentTier, setCurrentTier] = useState(0);
  const [isMaster, setIsMaster] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (guildId) {
      Promise.all([
        settingsService.getSettings(guildId),
        billingService.getConfig(),
      ])
        .then(([sData, bConfig]) => {
          if (sData.tier !== undefined) setCurrentTier(sData.tier);
          if (sData.isMaster !== undefined) setIsMaster(sData.isMaster);
          setStripeConfig(bConfig);
        })
        .catch((err) => {
          console.error('Failed to fetch billing data:', err);
          addToast('Failed to load billing config', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [guildId, addToast]);

  const handlePurchaseClick = async (tier: number) => {
    if (!stripeConfig?.products) {
      addToast('Billing configuration not loaded. Please refresh.', 'error');
      return;
    }

    const priceId = Object.keys(stripeConfig.products).find((pid) => {
      const p = stripeConfig.products[pid];
      return p.tier === tier && p.interval === billingInterval;
    });

    if (!priceId) {
      addToast('No Price ID found for this plan.', 'error');
      return;
    }

    setCheckoutLoading(tier);
    try {
      const data = await billingService.createCheckoutSession(priceId, guildId);
      if (data.url) {
        window.location.assign(data.url);
      } else {
        addToast('Failed to create checkout session', 'error');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      addToast(err?.message || 'An error occurred during checkout.', 'error');
    } finally {
      setCheckoutLoading(null);
    }
  };

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
