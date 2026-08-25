import api from './api_client';

export interface BillingConfig {
  public_key?: string;
  products?: Record<string, any>;
  success_url?: string;
  cancel_url?: string;
}

export const billingService = {
  async getConfig(): Promise<BillingConfig> {
    return api.get<BillingConfig>('/api/billing/config');
  },

  async createCheckoutSession(priceId: string, guildId: string): Promise<{ url: string }> {
    return api.post<{ url: string }>('/api/billing/checkout', { priceId, guildId });
  },

  async createPortalSession(guildId: string): Promise<{ url: string }> {
    return api.post<{ url: string }>('/api/billing/portal', { guildId });
  },

  async redeemPromoCode(code: string, guildId: string): Promise<{ success: boolean; newUntil: string }> {
    return api.post<{ success: boolean; newUntil: string }>('/api/billing/redeem', { code, guildId });
  }
};

export default billingService;
