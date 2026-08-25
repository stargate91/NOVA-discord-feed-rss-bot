import { GuildSettings, GuildInfo, DiscordRole } from "@/types/guild";

const settingsService = {
  /**
   * Fetch guild settings from the API.
   */
  async getSettings(guildId: string | number): Promise<GuildSettings> {
    const res = await fetch(`/api/guilds/${guildId}/settings`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    return await res.json();
  },

  /**
   * Fetch all user guilds from the API.
   */
  async getGuilds(): Promise<GuildInfo[]> {
    const res = await fetch('/api/guilds');
    if (!res.ok) {
      try {
        const errData = await res.json();
        throw new Error(errData.error || errData.details || "Failed to fetch guilds");
      } catch (e: any) {
        throw new Error(e?.message || "Failed to fetch guilds (Network Error)");
      }
    }
    return await res.json();
  },

  /**
   * Fetch guild roles from the API.
   */
  async getRoles(guildId: string | number): Promise<DiscordRole[]> {
    const res = await fetch(`/api/guilds/${guildId}/roles`);
    if (!res.ok) throw new Error("Failed to fetch roles");
    const data = await res.json();
    return Array.isArray(data) ? data : (data.roles || []);
  },

  /**
   * Update guild settings.
   */
  async updateSettings(guildId: string | number, settings: Partial<GuildSettings>): Promise<GuildSettings> {
    const res = await fetch(`/api/guilds/${guildId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update settings");
    }
    
    return await res.json();
  },

  /**
   * Create a Stripe billing portal session.
   */
  async getBillingPortalUrl(guildId: string | number): Promise<string> {
    const res = await fetch('/api/billing/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guildId: String(guildId) })
    });
    
    if (!res.ok) throw new Error("Failed to create billing portal session");
    
    const { url } = await res.json();
    return url;
  }
};

export default settingsService;
