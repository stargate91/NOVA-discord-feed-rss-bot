import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getUserGuilds } from "@/lib/permissions";
import { GuildInfo } from "@/types/guild";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch user guilds from Discord API (with caching)
    const userGuilds = await getUserGuilds(session);
    
    if (!userGuilds) {
      return NextResponse.json({ 
        error: "Discord API Busy", 
        details: "Please wait a moment. We are fetching your data from Discord." 
      }, { status: 429 });
    }

    console.log(`[API/Guilds] Found ${userGuilds.length} guilds for user.`);

    // 2. Fetch our bot's guild settings from DB
    console.log("[API/Guilds] Fetching bot settings from DB...");
    const botGuildsMap: Record<string, { premiumUntil: string | null; isActive: boolean }> = {};
    try {
      const dbRes = await pool.query('SELECT guild_id, premium_until, is_active FROM guild_settings');
      dbRes.rows.forEach(row => {
          botGuildsMap[String(row.guild_id)] = {
              premiumUntil: row.premium_until,
              isActive: row.is_active !== false // Treat null as true for legacy, only false is inactive
          };
      });
    } catch (dbErr: any) {
      console.warn("[API/Guilds] Could not fetch is_active (likely migration pending):", dbErr?.message);
      // Fallback: try without is_active
      const dbRes = await pool.query('SELECT guild_id, premium_until FROM guild_settings');
      dbRes.rows.forEach(row => {
          botGuildsMap[String(row.guild_id)] = {
              premiumUntil: row.premium_until,
              isActive: true // Fallback to true
          };
      });
    }

    // 3. Load Master Guilds from config.json
    console.log("[API/Guilds] Loading config.json...");
    let config: any = {};
    try {
      const configPath = path.resolve(process.cwd(), '../config.json');
      if (fs.existsSync(configPath)) {
        const rawData = fs.readFileSync(configPath, 'utf8');
        // Regex to find large numbers and wrap them in quotes to prevent precision loss
        const sanitizedData = rawData.replace(/:\s*([0-9]{15,})/g, ': "$1"');
        config = JSON.parse(sanitizedData);
      }
    } catch (cfgErr) {
      console.error("[API/Guilds] Config load failed (non-critical):", cfgErr);
    }
    
    const masterGuilds = config.master_guilds || {};

    // 4. Enrich & Filter
    console.log("[API/Guilds] Enriching guild data...");
    const rawGuilds = (userGuilds as any[])
      .map((guild): GuildInfo | null => {
        try {
          const isOwner = Boolean(guild.owner);
          // Check permissions safely
          const perms = BigInt(guild.permissions || "0");
          const isAdmin = (perms & BigInt(0x8)) === BigInt(0x8);
          const isManageGuild = (perms & BigInt(0x20)) === BigInt(0x20);
          
          const guildIdStr = String(guild.id);
          const botData = botGuildsMap[guildIdStr];
          const hasBot = botData ? botData.isActive : false;
          const premiumUntil = botData ? botData.premiumUntil : null;
          const isPremium = Boolean(premiumUntil && new Date(premiumUntil) > new Date());
          const isMaster = masterGuilds.hasOwnProperty(guildIdStr);

          return {
            id: guildIdStr,
            name: guild.name,
            icon: guild.icon,
            bot_in_guild: hasBot,
            hasBot,
            isPremium,
            isMaster,
            isOwner,
            isAdmin,
            canManage: isOwner || isAdmin || isManageGuild
          };
        } catch (err) {
          console.error(`[API/Guilds] Error processing guild ${guild.id}:`, err);
          return null;
        }
      });

    const enrichedGuilds: GuildInfo[] = rawGuilds
      .filter((g): g is GuildInfo => g !== null && Boolean(g.canManage));

    // Sort: Master first, then Premium, then Bot Active, then alphabetical
    enrichedGuilds.sort((a, b) => {
      if (Boolean(a.isMaster) !== Boolean(b.isMaster)) return b.isMaster ? 1 : -1;
      if (Boolean(a.isPremium) !== Boolean(b.isPremium)) return b.isPremium ? 1 : -1;
      if (Boolean(a.bot_in_guild) !== Boolean(b.bot_in_guild)) return b.bot_in_guild ? 1 : -1;
      return (a.name || '').localeCompare(b.name || '');
    });

    console.log(`[API/Guilds] Returning ${enrichedGuilds.length} allowed guilds.`);
    return NextResponse.json(enrichedGuilds);
  } catch (error: any) {
    console.error("[API/Guilds] CRITICAL ERROR:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined 
    }, { status: 500 });
  }
}
