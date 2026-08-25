import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { canManageGuild } from "@/lib/permissions";
import { isMasterGuild, resolveGuildFeatures } from "@/lib/config";
import { PLATFORM_NAMES } from "@/constants/platforms";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guild");
  const days = parseInt(searchParams.get("days") || "14", 10) || 14;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Case 1: Guild-specific stats
    if (guildId) {
      // 0. Permission check
      const allowed = await canManageGuild(session, guildId);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // 1. Enforce Tier Limits for requested days
      const guildRes = await pool.query('SELECT tier, is_master, is_premium, premium_until FROM guild_settings WHERE guild_id = $1::bigint', [guildId]);

      let tier = guildRes.rows[0]?.tier || 0;
      const isMaster = guildRes.rows[0]?.is_master || false;
      const premiumUntil = guildRes.rows[0]?.premium_until;
      if (tier === 0 && premiumUntil && new Date(premiumUntil) > new Date()) tier = 3;

      let maxAllowedDays = 3; // Free Tier: 3 days
      
      const configIsMaster = isMasterGuild(guildId);
      const isMasterUser = (session.user as any)?.role === 'master';

      if (isMaster || configIsMaster || isMasterUser || tier >= 3) maxAllowedDays = 99999; // Unlimited/All-time
      else if (tier >= 2) maxAllowedDays = 30; // Professional: 30 days
      else if (tier >= 1) maxAllowedDays = 7;  // Starter: 7 days

      const effectiveDays = Math.min(days, maxAllowedDays);
      console.log(`[API Stats] Fetching stats for guild: ${guildId}, requested: ${days}, allowed: ${effectiveDays}`);

      // 1. Message History (Dynamic Interval)
      const historyRes = await pool.query(`
        SELECT date::text, SUM(post_count) as count 
        FROM monitor_stats_daily 
        WHERE guild_id = $1::bigint AND date::date >= CURRENT_DATE - ($2 || ' days')::interval
        GROUP BY date 
        ORDER BY date ASC
      `, [guildId, effectiveDays]);

      // 2. Period Comparison for Growth / Trend (Current period vs Previous equal period)
      const periodComparisonRes = await pool.query(`
        SELECT 
          SUM(CASE WHEN date::date >= CURRENT_DATE - ($2 || ' days')::interval THEN post_count ELSE 0 END) as current_posts,
          SUM(CASE WHEN date::date >= CURRENT_DATE - (($2 * 2) || ' days')::interval AND date::date < CURRENT_DATE - ($2 || ' days')::interval THEN post_count ELSE 0 END) as previous_posts
        FROM monitor_stats_daily
        WHERE guild_id = $1::bigint AND date::date >= CURRENT_DATE - (($2 * 2) || ' days')::interval
      `, [guildId, effectiveDays]);

      const currentPosts = parseInt(periodComparisonRes.rows[0]?.current_posts || '0', 10) || 0;
      const previousPosts = parseInt(periodComparisonRes.rows[0]?.previous_posts || '0', 10) || 0;
      let growthRate = 0;
      if (previousPosts === 0) {
        growthRate = currentPosts > 0 ? 100 : 0;
      } else {
        growthRate = Math.round(((currentPosts - previousPosts) / previousPosts) * 1000) / 10;
      }

      const trend = {
        growthRate,
        value: Math.abs(growthRate),
        isPositive: growthRate >= 0,
        currentPosts,
        previousPosts,
      };

      // 3. Platform Breakdown with Pre-aggregated Percentages
      const platformRes = await pool.query(`
        SELECT platform, SUM(post_count) as count 
        FROM monitor_stats_daily 
        WHERE guild_id = $1::bigint AND date::date >= CURRENT_DATE - ($2 || ' days')::interval
        GROUP BY platform
        ORDER BY count DESC
      `, [guildId, effectiveDays]);

      // 4. Totals for this guild
      const totalsRes = await pool.query(`
        SELECT SUM(post_count) as total_posts, COUNT(DISTINCT platform) as platform_count
        FROM monitor_stats_daily
        WHERE guild_id = $1::bigint AND date::date >= CURRENT_DATE - ($2 || ' days')::interval
      `, [guildId, effectiveDays]);

      const totalPosts = parseInt(totalsRes?.rows[0]?.total_posts, 10) || 0;

      const rawPlatforms = platformRes?.rows || [];
      const platforms = rawPlatforms.map((p: any) => {
        const count = parseInt(p.count, 10) || 0;
        const percentage = totalPosts > 0 ? Math.round((count / totalPosts) * 1000) / 10 : 0;
        const name = PLATFORM_NAMES[p.platform] || p.platform;
        return {
          id: p.platform,
          platform: p.platform,
          name,
          displayName: name,
          count,
          percentage,
        };
      });

      const monitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE guild_id = $1::bigint AND enabled = true', [guildId]);

      // 5. Heatmap Raw & Pre-aggregated 7x24 Matrix
      const heatmapRes = await pool.query(`
        SELECT 
          EXTRACT(DOW FROM published_at)::int as day,
          EXTRACT(HOUR FROM published_at)::int as hour,
          COUNT(*)::int as count
        FROM published_entries_v2
        WHERE guild_id = $1::bigint AND published_at >= CURRENT_DATE - ($2 || ' days')::interval
        GROUP BY day, hour
        ORDER BY day, hour
      `, [guildId, effectiveDays]);

      const rawHeatmap = heatmapRes?.rows || [];
      const heatmapGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
      let maxDensity = 0;

      rawHeatmap.forEach((item: any) => {
        const day = Number(item.day);
        const hour = Number(item.hour);
        const count = Number(item.count) || 0;
        if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
          heatmapGrid[day][hour] = count;
          if (count > maxDensity) maxDensity = count;
        }
      });

      const heatmapMatrix = {
        matrix: heatmapGrid,
        max: maxDensity || 1,
      };

      const effectiveIsMaster = isMaster || configIsMaster || isMasterUser;
      const features = resolveGuildFeatures(guildId, tier, effectiveIsMaster, premiumUntil);

      const result = {
        history: historyRes?.rows || [],
        platforms,
        totalPosts,
        previousPeriodPosts: previousPosts,
        trend,
        activeMonitors: parseInt(monitorsRes?.rows[0]?.count, 10) || 0,
        platformCount: parseInt(totalsRes?.rows[0]?.platform_count, 10) || 0,
        heatmap: rawHeatmap,
        heatmapMatrix,
        maxAllowedDays,
        tier: tier,
        isMaster: effectiveIsMaster,
        isPremium: effectiveIsMaster || (guildRes?.rows[0]?.is_premium || false),
        features
      };

      console.log(`[API Stats] Success for guild ${guildId}`);
      return NextResponse.json(result);
    }

    // Case 2: Global stats (Masters only)
    if ((session.user as any)?.role !== "master") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const monitorsRes = await pool.query('SELECT COUNT(*) FROM monitors WHERE enabled = true');
    const statsRes = await pool.query('SELECT SUM(post_count) FROM monitor_stats_daily');
    const guildsRes = await pool.query('SELECT COUNT(*) FROM guild_settings');

    return NextResponse.json({
      activeMonitors: parseInt(monitorsRes.rows[0].count, 10),
      totalPosts: parseInt(statsRes.rows[0].sum, 10) || 0,
      totalGuilds: parseInt(guildsRes.rows[0].count, 10)
    });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({
      history: [],
      platforms: [],
      totalPosts: 0,
      activeMonitors: 0,
      platformCount: 0,
      heatmap: [],
      tier: 0,
      isMaster: false,
      isPremium: false
    });
  }
}
