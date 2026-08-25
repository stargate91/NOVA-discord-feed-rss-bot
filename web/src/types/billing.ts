export type TierLevel = 0 | 1 | 2 | 3;

export interface TierPlan {
  id: string;
  tier: TierLevel;
  name: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  maxMonitors: number;
  checkInterval: string;
  popular?: boolean;
}

export interface PromoRedemptionResult {
  success: boolean;
  message: string;
  tier?: TierLevel;
  premium_until?: string;
}

export interface StripeCheckoutResponse {
  url?: string;
  error?: string;
}
