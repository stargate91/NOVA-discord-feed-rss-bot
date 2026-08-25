"use client";

import React from 'react';
import {
  Badge,
  SegmentedControl,
  Stack,
  Heading,
  Text,
} from '@/components/ui';
import { PricingCard } from './pricing_card';
import { PremiumComparisonTable } from './premium_comparison_table';
import { TIERS, TierItem } from '@/constants/tiers';
import { BillingInterval } from '@/hooks/use_pricing_plan_selection';
import styles from './pricing_section.module.css';

export interface PricingSectionProps {
  billingInterval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
  onPurchaseClick: (tier: number) => void;
  getTierPrice: (tier: TierItem) => string;
  currentTier?: number;
  isMaster?: boolean;
  checkoutLoading?: number | null;
  tiers?: TierItem[];
  comparisonTitle?: string;
  comparisonDescription?: string;
  hideComparison?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  billingInterval,
  onIntervalChange,
  onPurchaseClick,
  getTierPrice,
  currentTier,
  isMaster,
  checkoutLoading,
  tiers = TIERS,
  comparisonTitle = 'Compare Plan Features',
  comparisonDescription = 'Everything you need to know about limits and exclusive perks.',
  hideComparison = false,
}) => {
  return (
    <div className={styles['section-container']}>
      {/* ── Billing Interval Switcher ── */}
      <div className={styles['switcher-row']}>
        <SegmentedControl<BillingInterval>
          value={billingInterval}
          onChange={onIntervalChange}
          options={[
            { value: 'mo', label: 'Monthly Billing' },
            {
              value: 'yr',
              label: (
                <span className={styles['yearly-label']}>
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
        {tiers.map((t) => (
          <PricingCard
            key={t.tier}
            tier={t.tier}
            currentTier={currentTier}
            isMaster={isMaster}
            title={t.title}
            description={t.description}
            price={getTierPrice(t)}
            interval={billingInterval === 'mo' ? 'mo' : 'yr'}
            isPopular={t.isPopular}
            features={t.features}
            onPurchaseClick={() => onPurchaseClick(t.tier)}
            isLoading={checkoutLoading === t.tier}
          />
        ))}
      </div>

      {/* ── Feature Comparison Table ── */}
      {!hideComparison && (
        <div className={styles['comparison-wrapper']}>
          <Stack gap="md" align="center">
            <Heading level={2} size="3xl" weight="bold">
              {comparisonTitle}
            </Heading>
            <Text as="p" size="sm" variant="muted">
              {comparisonDescription}
            </Text>
            <PremiumComparisonTable />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
