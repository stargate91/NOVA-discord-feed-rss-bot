import React from 'react';
import { Grid } from '@/ui';
import { PLANS_CONFIG } from './plansConfig';
import { PricingCard } from './PricingCard';

export interface PricingCardsGridProps {
  billingInterval?: 'month' | 'year';
}

export const PricingCardsGrid: React.FC<PricingCardsGridProps> = ({
  billingInterval = 'month',
}) => {
  return (
    <Grid minItemWidth="sm" gap="xl">
      {PLANS_CONFIG.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          billingInterval={billingInterval}
        />
      ))}
    </Grid>
  );
};
