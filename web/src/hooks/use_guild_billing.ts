import { useState, useEffect } from 'react';
import billingService from '@/services/billing_service';
import settingsService from '@/services/settings_service';
import { useToast } from '@/context/toast_context';
import { findStripePriceId } from '@/utils/billing';

export function useGuildBilling(guildId: string) {
  const { addToast } = useToast();

  const [billingInterval, setBillingInterval] = useState<'mo' | 'yr'>('mo');
  const [currentTier, setCurrentTier] = useState(0);
  const [isMaster, setIsMaster] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId) return;
    let ignore = false;

    Promise.all([
      settingsService.getSettings(guildId),
      billingService.getConfig(),
    ])
      .then(([sData, bConfig]) => {
        if (!ignore) {
          if (sData.tier !== undefined) setCurrentTier(sData.tier);
          if (sData.isMaster !== undefined) setIsMaster(sData.isMaster);
          setStripeConfig(bConfig);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to fetch billing data:', err);
          addToast('Failed to load billing config', 'error');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [guildId, addToast]);

  const handlePurchaseClick = async (tier: number) => {
    if (!stripeConfig?.products) {
      addToast('Billing configuration not loaded. Please refresh.', 'error');
      return;
    }

    const priceId = findStripePriceId(
      stripeConfig.products,
      tier,
      billingInterval
    );

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

  return {
    billingInterval,
    setBillingInterval,
    currentTier,
    isMaster,
    stripeConfig,
    checkoutLoading,
    loading,
    handlePurchaseClick,
  };
}
