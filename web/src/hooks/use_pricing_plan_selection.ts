import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { TIERS, TierItem } from '@/constants/tiers';
import billingService from '@/services/billing_service';
import { useToast } from '@/context/toast_context';
import { TOAST_MESSAGES } from '@/constants/toasts';

export type BillingInterval = 'mo' | 'yr';

export interface UsePricingPlanSelectionOptions {
  guildId?: string | null;
  defaultInterval?: BillingInterval;
}

export function usePricingPlanSelection(options?: UsePricingPlanSelectionOptions) {
  const guildId = options?.guildId || null;
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();

  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    options?.defaultInterval || 'mo'
  );
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  const getTierPrice = useCallback(
    (tier: TierItem) => {
      return billingInterval === 'mo' ? tier.price.mo : tier.price.yr;
    },
    [billingInterval]
  );

  const handlePurchaseClick = useCallback(
    async (tier: number) => {
      if (guildId) {
        setCheckoutLoading(tier);
        try {
          await billingService.initiateCheckoutSession(
            {
              tier,
              interval: billingInterval,
              guildId,
            },
            {
              onError: (errorMsg) => {
                toast.error(errorMsg, TOAST_MESSAGES.BILLING.CHECKOUT_ERROR);
              },
            }
          );
        } finally {
          setCheckoutLoading(null);
        }
      } else {
        if (!session) {
          signIn('discord', { callbackUrl: '/servers' });
          return;
        }
        router.push('/servers');
      }
    },
    [guildId, billingInterval, session, router, toast]
  );

  return {
    session,
    billingInterval,
    setBillingInterval,
    checkoutLoading,
    handlePurchaseClick,
    getTierPrice,
    tiers: TIERS,
  };
}
