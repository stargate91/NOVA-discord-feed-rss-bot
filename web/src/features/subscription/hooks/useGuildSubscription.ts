import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import { toGuildTier } from '@/auth/entitlements';
import { VALID_PROMO_CODES, DEFAULT_GUILD_ENTITLEMENTS } from '../constants';
import type { GuildEntitlements, UseGuildSubscriptionReturn, GuildTier } from '../types';

export const useGuildSubscription = (
  _guildId: string,
  initialEntitlements?: Partial<GuildEntitlements>
): UseGuildSubscriptionReturn => {
  const { t } = useTranslation();
  const toast = useToast();

  const [entitlements, setEntitlements] = useState<GuildEntitlements>({
    ...DEFAULT_GUILD_ENTITLEMENTS,
    ...initialEntitlements,
  });
  const [promoCode, setPromoCode] = useState<string>('');
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);

  const applyPromoCode = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const code = promoCode.trim().toLowerCase();

      if (!code) {
        toast.warning(t('guild.toastPromoRequired'), t('guild.toastPromoRequiredTitle'));
        return;
      }

      setIsApplyingPromo(true);

      if (VALID_PROMO_CODES.includes(code)) {
        setEntitlements((prev) => ({
          ...prev,
          tier: 'ultimate',
          tier_name: 'Ultimate Tier (Promo Applied)',
          max_monitors: 50,
          min_poll_interval_seconds: 30,
          raw_csv_export_allowed: true,
        }));
        toast.success(t('guild.toastPromoSuccess'), t('guild.toastPromoSuccessTitle'));
        setPromoCode('');
      } else {
        toast.error(t('guild.toastPromoInvalid'), t('guild.toastPromoInvalidTitle'));
      }

      setIsApplyingPromo(false);
    },
    [promoCode, t, toast]
  );

  const activeTier: GuildTier = useMemo(() => toGuildTier(entitlements.tier), [entitlements.tier]);

  return {
    entitlements,
    promoCode,
    setPromoCode,
    applyPromoCode,
    isApplyingPromo,
    activeTier,
  };
};
