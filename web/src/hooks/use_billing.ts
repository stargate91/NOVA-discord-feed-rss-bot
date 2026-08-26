import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { TIERS, TierItem } from '@/constants/tiers';
import billingService, { CreateCheckoutParams } from '@/services/billing_service';
import { useToast } from '@/context/toast_context';
import { useMatchingGuildContext } from '@/context/guild_context';
import { TOAST_MESSAGES } from '@/constants/toasts';

export type BillingInterval = 'mo' | 'yr';

export interface UseBillingOptions {
  guildId?: string | null;
  defaultInterval?: BillingInterval;
}

export function useBilling(options?: UseBillingOptions) {
  const guildId = options?.guildId || null;
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToast();
  const guildCtx = useMatchingGuildContext(guildId);

  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    options?.defaultInterval || 'mo'
  );
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const currentTier = guildCtx ? guildCtx.effectiveTier : 0;
  const isMaster = guildCtx ? guildCtx.isMaster : false;
  const isPremium = guildCtx ? guildCtx.isPremium : false;
  const loading = guildCtx ? (guildCtx.loading && !guildCtx.settings) : false;

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
              onError: (errMsg) => toast.error(errMsg, TOAST_MESSAGES.BILLING.CHECKOUT_ERROR),
            }
          );
        } catch (err: unknown) {
          toast.error(err, TOAST_MESSAGES.BILLING.CHECKOUT_ERROR);
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

  const openBillingPortal = useCallback(async () => {
    if (!guildId) return;
    setPortalLoading(true);
    try {
      const { url } = await billingService.createPortalSession(guildId);
      if (url) {
        window.location.href = url;
      }
    } catch (e: unknown) {
      console.error('Billing portal error:', e);
      toast.error(e, TOAST_MESSAGES.BILLING.PORTAL_ERROR);
    } finally {
      setPortalLoading(false);
    }
  }, [guildId, toast]);

  const handleRedeem = useCallback(async () => {
    if (!guildId || !redeemCode.trim()) return;
    setRedeeming(true);
    try {
      const data = await billingService.redeemPromoCode(redeemCode, guildId);
      if (data.success) {
        toast.success(TOAST_MESSAGES.SETTINGS.REDEEM_SUCCESS);
        setRedeemCode('');
        if (guildCtx) {
          await guildCtx.refreshGuild();
        }
      } else {
        toast.error((data as any).error, TOAST_MESSAGES.SETTINGS.REDEEM_ERROR);
      }
    } catch (err: unknown) {
      toast.error(err, TOAST_MESSAGES.SETTINGS.REDEEM_ERROR);
    } finally {
      setRedeeming(false);
    }
  }, [guildId, redeemCode, guildCtx, toast]);

  return {
    session,
    status,
    billingInterval,
    setBillingInterval,
    checkoutLoading,
    handlePurchaseClick,
    getTierPrice,
    tiers: TIERS,
    currentTier,
    isMaster,
    isPremium,
    loading,
    portalLoading,
    openBillingPortal,
    redeemCode,
    setRedeemCode,
    redeeming,
    handleRedeem,
  };
}

export default useBilling;
