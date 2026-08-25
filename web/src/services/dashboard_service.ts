import pool from "@/lib/db";
import fs from "fs";
import path from "path";

export interface GlobalDashboardStats {
  activeMonitors: number;
  totalPosts: number;
  totalGuilds: number;
  viewType: string;
  error?: string;
}

export interface GuildDashboardStats {
  activeMonitors: number;
  totalMonitorsCount: number;
  totalPosts: number;
  isPremium: boolean;
  isLifetime: boolean;
  maxMonitors: number;
  tier: number;
  tierName: string;
  viewType: string;
  error?: string;
}

const dashboardService = {
  async getGlobalStats(): Promise<GlobalDashboardStats> {
    try {
      const monitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE enabled = true');
      const statsRes = await pool.query('SELECT SUM(post_count) FROM monitor_stats_daily');
      const guildsRes = await pool.query('SELECT COUNT(*) FROM guild_settings');

      return {
        activeMonitors: parseInt(monitorsRes.rows[0].count, 10),
        totalPosts: parseInt(statsRes.rows[0].sum, 10) || 0,
        totalGuilds: parseInt(guildsRes.rows[0].count, 10),
        viewType: "Global"
      };
    } catch (error: any) {
      console.error("DB Fetch Error:", error);
      return {
        activeMonitors: 0,
        totalPosts: 0,
        totalGuilds: 0,
        viewType: "Global",
        error: error?.message || String(error)
      };
    }
  },

  async getGuildStats(guildId: string | number, session: any): Promise<GuildDashboardStats | null> {
    if (!session) return null;
    const cleanId = String(guildId).replace('-', '');
    
    try {
      let masterGuilds: Record<string, any> = {};
      try {
        const configPath = path.join(process.cwd(), '..', 'config.json');
        if (fs.existsSync(configPath)) {
          const rawData = fs.readFileSync(configPath, 'utf8');
          const sanitizedData = rawData.replace(/:\s*([0-9]{15,})/g, ': "$1"');
          const config = JSON.parse(sanitizedData);
          masterGuilds = config.master_guilds || {};
        }
      } catch (e: any) {
        console.error("[Dashboard] Config Load Error:", e?.message || e);
      }

      let monitorsRes: any = { rows: [] };
      let totalMonitorsRes: any = { rows: [] };
      let statsRes: any = { rows: [] };
      let guildInfo: any = { rows: [] };

      try {
        monitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE guild_id = $1::bigint AND enabled = true', [cleanId]);
        totalMonitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE guild_id = $1::bigint', [cleanId]);
        statsRes = await pool.query('SELECT SUM(post_count) FROM monitor_stats_daily WHERE guild_id = $1::bigint', [cleanId]);
        guildInfo = await pool.query('SELECT premium_until, tier FROM guild_settings WHERE guild_id = $1::bigint', [cleanId]);
      } catch (dbErr: any) {
        console.warn("[Dashboard] Local DB query skipped (no DB connection):", dbErr?.message);
      }

      const premiumUntil = guildInfo.rows[0]?.premium_until;
      let tier = guildInfo.rows[0]?.tier || 0;
      const now = new Date();
      const isMasterGuild = Object.prototype.hasOwnProperty.call(masterGuilds, cleanId);

      // Legacy support: If tier is 0 but premium_until is valid, treat as Tier 3
      const isLegacyPremium = premiumUntil && new Date(premiumUntil) > now;
      if (tier === 0 && isLegacyPremium) tier = 3;

      const isLifetime = Boolean(isMasterGuild || (premiumUntil && new Date(premiumUntil) > new Date('2090-01-01')));
      const isPremium = isLifetime || tier >= 1;

      let maxMonitors = 3;
      if (isMasterGuild) maxMonitors = 1000;
      else {
        switch (tier) {
          case 1: maxMonitors = 10; break;
          case 2: maxMonitors = 30; break;
          case 3: maxMonitors = 100; break;
          default: maxMonitors = 3;
        }
      }

      const tierNames = ["Free", "Starter", "Professional", "Ultimate"];
      const currentTierName = isMasterGuild ? "Master" : (tierNames[tier] || "Free");

      return {
        activeMonitors: parseInt(monitorsRes.rows[0]?.count || '0', 10),
        totalMonitorsCount: parseInt(totalMonitorsRes.rows[0]?.count || '0', 10),
        totalPosts: parseInt(statsRes.rows[0]?.sum || '0', 10),
        isPremium,
        isLifetime,
        maxMonitors,
        tier,
        tierName: currentTierName,
        viewType: `Guild ${cleanId}`
      };
    } catch (error: any) {
      console.warn("[Dashboard] Guild Stats Fallback:", error?.message);
      return {
        activeMonitors: 0,
        totalMonitorsCount: 0,
        totalPosts: 0,
        isPremium: false,
        isLifetime: false,
        maxMonitors: 3,
        tier: 0,
        tierName: "Free",
        viewType: `Guild ${cleanId}`
      };
    }
  }
};

export default dashboardService;
