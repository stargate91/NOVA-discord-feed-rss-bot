import type { GuildEntitlements, GuildTier } from '@/types';

export interface UseGuildSubscriptionReturn {
  entitlements: GuildEntitlements;
  promoCode: string;
  setPromoCode: (code: string) => void;
  applyPromoCode: (e?: React.FormEvent) => void;
  isApplyingPromo: boolean;
  activeTier: GuildTier;
}

export type { GuildEntitlements, GuildTier };
