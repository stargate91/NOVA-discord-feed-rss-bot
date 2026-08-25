import api from './api_client';
import { extractErrorMessage } from '@/utils/toast';

export interface BillingConfig {
  public_key?: string;
  products?: Record<string, any>;
  success_url?: string;
  cancel_url?: string;
}

export interface CreateCheckoutParams {
  guildId: string;
  tier?: number;
  interval?: 'mo' | 'yr';
  priceId?: string;
}

export const billingService = {
  async getConfig(): Promise<BillingConfig> {
    return api.get<BillingConfig>('/api/billing/config');
  },

  async createCheckoutSession(
    paramsOrPriceId: string | CreateCheckoutParams,
    guildId?: string
  ): Promise<{ url: string }> {
    const payload =
      typeof paramsOrPriceId === 'string'
        ? { priceId: paramsOrPriceId, guildId }
        : paramsOrPriceId;
    return api.post<{ url: string }>('/api/billing/checkout', payload);
  },

  async createPortalSession(guildId: string): Promise<{ url: string }> {
    return api.post<{ url: string }>('/api/billing/portal', { guildId });
  },

  async redeemPromoCode(code: string, guildId: string): Promise<{ success: boolean; newUntil: string }> {
    return api.post<{ success: boolean; newUntil: string }>('/api/billing/redeem', { code, guildId });
  },

  async initiateCheckoutSession(
    params: CreateCheckoutParams,
    options?: {
      onSuccess?: (url: string) => void;
      onError?: (error: string) => void;
    }
  ): Promise<string | null> {
    try {
      const data = await this.createCheckoutSession(params);
      if (data?.url) {
        if (options?.onSuccess) {
          options.onSuccess(data.url);
        } else {
          window.location.assign(data.url);
        }
        return data.url;
      }
      const msg = 'Failed to create checkout session';
      options?.onError?.(msg);
      return null;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'An error occurred during checkout.');
      options?.onError?.(msg);
      return null;
    }
  }
};

export default billingService;

