import { useState, useCallback } from 'react';
import { useOptionalGuildContext } from '@/context/guild_context';
import { usePricingPlanSelection } from '@/hooks/use_pricing_plan_selection';
import billingService from '@/services/billing_service';
import { useToast } from '@/context/toast_context';
import { TOAST_MESSAGES } from '@/constants/toasts';

export function useGuildBilling(guildId: string) {
  const toast = useToast();
  const guildCtx = useOptionalGuildContext();
  const isContextMatch = Boolean(guildCtx && String(guildCtx.guildId) === String(guildId));

  const {
    billingInterval,
    setBillingInterval,
    checkoutLoading,
    handlePurchaseClick,
    getTierPrice,
    tiers,
  } = usePricingPlanSelection({ guildId });

  const [portalLoading, setPortalLoading] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const currentTier = isContextMatch && guildCtx ? guildCtx.effectiveTier : 0;
  const isMaster = isContextMatch && guildCtx ? guildCtx.isMaster : false;
  const isPremium = isContextMatch && guildCtx ? guildCtx.isPremium : false;
  const loading = isContextMatch && guildCtx ? (guildCtx.loading && !guildCtx.settings) : false;

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
    billingInterval,
    setBillingInterval,
    currentTier,
    isMaster,
    isPremium,
    checkoutLoading,
    loading,
    handlePurchaseClick,
    getTierPrice,
    tiers,
    portalLoading,
    openBillingPortal,
    redeemCode,
    setRedeemCode,
    redeeming,
    handleRedeem,
  };
}

export default useGuildBilling;

