import React from 'react';
import { Grid } from '@/ui';
import { PLANS_CONFIG } from './plansConfig';
import { PricingCard } from './PricingCard';

export const PricingCardsGrid: React.FC = () => {
  return (
    <Grid minItemWidth="sm" gap="2xl">
      {PLANS_CONFIG.map((plan) => (
        <PricingCard key={plan.id} plan={plan} />
      ))}
    </Grid>
  );
};
