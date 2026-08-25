import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { isMasterGuild, resolveGuildFeatures } from "@/lib/config";
import { GuildFeatures } from "@/types/guild";
import { getDashboardTierMeta } from "@/utils/tier_limits";

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
  features: GuildFeatures;
  error?: string;
}

export interface GuildDashboardData {
  stats: GuildDashboardStats | null;
  tierMeta: ReturnType<typeof getDashboardTierMeta>;
  error?: string;
}

export async function getGlobalDashboardStats(): Promise<GlobalDashboardStats> {
  try {
    const monitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE enabled = true');
    const statsRes = await pool.query('SELECT SUM(post_count) FROM monitor_stats_daily');
    const guildsRes = await pool.query('SELECT COUNT(*) FROM guild_settings');

    return {
      activeMonitors: parseInt(monitorsRes.rows[0]?.count || '0', 10),
      totalPosts: parseInt(statsRes.rows[0]?.sum || '0', 10),
      totalGuilds: parseInt(guildsRes.rows[0]?.count || '0', 10),
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
}

export async function getGuildDashboardStats(guildId: string | number, session: any): Promise<GuildDashboardStats | null> {
  if (!session) return null;
  const cleanId = String(guildId).replace('-', '');

  try {
    let monitorsRes: any = { rows: [] };
    let totalMonitorsRes: any = { rows: [] };
    let statsRes: any = { rows: [] };
    let guildInfo: any = { rows: [] };

    try {
      monitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE guild_id = $1::bigint AND enabled = true', [cleanId]);
      totalMonitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE guild_id = $1::bigint', [cleanId]);
      statsRes = await pool.query('SELECT SUM(post_count) FROM monitor_stats_daily WHERE guild_id = $1::bigint', [cleanId]);
      guildInfo = await pool.query('SELECT premium_until, tier, is_master FROM guild_settings WHERE guild_id = $1::bigint', [cleanId]);
    } catch (dbErr: any) {
      console.warn("[Dashboard Server] DB query skipped (no DB connection):", dbErr?.message);
    }

    const premiumUntil = guildInfo.rows[0]?.premium_until;
    let tier = guildInfo.rows[0]?.tier || 0;
    const dbIsMaster = Boolean(guildInfo.rows[0]?.is_master);
    const effectiveIsMaster = isMasterGuild(cleanId) || dbIsMaster;

    const features = resolveGuildFeatures(cleanId, tier, effectiveIsMaster, premiumUntil);
    const isLifetime = Boolean(effectiveIsMaster || (premiumUntil && new Date(premiumUntil) > new Date('2090-01-01')));

    return {
      activeMonitors: parseInt(monitorsRes.rows[0]?.count || '0', 10),
      totalMonitorsCount: parseInt(totalMonitorsRes.rows[0]?.count || '0', 10),
      totalPosts: parseInt(statsRes.rows[0]?.sum || '0', 10),
      isPremium: features.isPremium,
      isLifetime,
      maxMonitors: features.maxMonitors,
      tier: features.tier,
      tierName: features.tierName,
      viewType: `Guild ${cleanId}`,
      features,
    };
  } catch (error: any) {
    console.warn("[Dashboard Server] Guild Stats Fallback:", error?.message);
    const fallbackFeatures = resolveGuildFeatures(cleanId, 0, false, null);
    return {
      activeMonitors: 0,
      totalMonitorsCount: 0,
      totalPosts: 0,
      isPremium: false,
      isLifetime: false,
      maxMonitors: fallbackFeatures.maxMonitors,
      tier: 0,
      tierName: "Free",
      viewType: `Guild ${cleanId}`,
      features: fallbackFeatures,
      error: error?.message,
    };
  }
}

export async function getGuildDashboardData(
  guildId: string,
  session: any
): Promise<GuildDashboardData> {
  if (!session) {
    redirect('/');
  }

  if (!guildId) {
    redirect('/servers');
  }

  const stats = await getGuildDashboardStats(guildId, session);

  if (stats?.error) {
    return {
      stats: null,
      tierMeta: getDashboardTierMeta(null),
      error: stats.error,
    };
  }

  const tierMeta = getDashboardTierMeta(stats);

  return {
    stats,
    tierMeta,
  };
}

export const serverDashboardService = {
  getGlobalStats: getGlobalDashboardStats,
  getGuildStats: getGuildDashboardStats,
  getDashboardData: getGuildDashboardData,
};

export default serverDashboardService;

