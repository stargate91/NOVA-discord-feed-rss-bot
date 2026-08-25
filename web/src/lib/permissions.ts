import pool from "./db";
import { GuildInfo, GuildPermissions } from "@/types/guild";

interface CacheEntry {
  guilds: GuildInfo[];
  timestamp: number;
  userId?: string;
}

// In-memory cache for user guilds to prevent Discord rate limits (429)
const guildCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<GuildInfo[] | null>>();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Fetches user guilds from Discord with caching, deduplication, and rate-limit handling.
 */
export async function getUserGuilds(session: any): Promise<GuildInfo[] | null> {
  if (!session || !session.accessToken) return null;

  let userId = session.user?.id;
  const cacheKey = userId || session.accessToken;
  
  // 1. Check if we have a fresh cached version
  const cached = guildCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.guilds;
  }

  // 2. Check if a request is already in progress for this user
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  // 3. Start a new request and track it
  const fetchPromise = (async (): Promise<GuildInfo[] | null> => {
    try {
      // --- Fallback: If userId is missing, fetch it from @me ---
      if (!userId) {
        try {
          const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            userId = userData.id;
            console.log(`[Permissions] Recovered missing user ID: ${userId}`);
          }
        } catch (e) {
          console.error("[Permissions] Failed to recover user ID:", e);
        }
      }

      const discordRes = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: 'no-store'
      });

      if (discordRes.ok) {
        const userGuilds: GuildInfo[] = await discordRes.json();
        // Update cache with recovered ID if available
        guildCache.set(userId || cacheKey, { guilds: userGuilds, timestamp: Date.now(), userId });
        return userGuilds;
      }

      if (discordRes.status === 429) {
        if (cached) return cached.guilds;
        return null;
      }

      return cached ? cached.guilds : null;
    } catch (error) {
      console.error("[Permissions] Fetch Error:", error);
      return cached ? cached.guilds : null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Checks if a user has permission to manage a specific guild.
 */
export async function canManageGuild(session: any, guildId: string | number): Promise<boolean> {
  if (!session) return false;

  // 1. Master users can manage everything
  if (session.user?.role === "master") return true;

  if (!guildId) return false;
  const cleanGuildId = String(guildId).trim();
  const userId = session.user?.id;

  // 2. Try Authoritative Check via Bot first
  if (userId) {
    const botPerms = await getBotPermissions(cleanGuildId, userId);
    if (botPerms && botPerms.bot_in_guild) {
      return botPerms.is_admin;
    }
  }

  // 3. Fallback to local logic (for when bot is NOT in guild)
  let adminRoleId: string | null = null;
  try {
    const settingsRes = await pool.query('SELECT admin_role_id FROM guild_settings WHERE guild_id = $1::bigint', [cleanGuildId]);
    if (settingsRes.rows.length > 0) {
      adminRoleId = settingsRes.rows[0].admin_role_id ? String(settingsRes.rows[0].admin_role_id) : null;
    }
  } catch (dbErr) {
    console.error("[Permissions] DB Error fetching guild settings:", dbErr);
  }

  // Check Discord permissions
  const userGuilds = await getUserGuilds(session);
  if (userGuilds) {
    const guild = userGuilds.find(g => String(g.id) === cleanGuildId);
    if (guild) {
      const perms = BigInt(guild.permissions || "0");
      const isAdmin = (perms & BigInt(0x8)) === BigInt(0x8);
      const isManageGuild = (perms & BigInt(0x20)) === BigInt(0x20);
      const isManageChannels = (perms & BigInt(0x10)) === BigInt(0x10);
      const isManageWebhooks = (perms & BigInt(0x20000000)) === BigInt(0x20000000);
      const isAuditLog = (perms & BigInt(0x80)) === BigInt(0x80);
      const isOwner = Boolean(guild.owner);

      const allowed = isOwner || isAdmin || isManageGuild || isManageChannels || isManageWebhooks || isAuditLog;

      if (allowed) {
        return true;
      }
    }
  }

  // Fallback: Check for specific Admin Role via Bot Token
  const botToken = process.env.BOT_TOKEN;
  const effectiveUserId = session.user?.id || guildCache.get(session.accessToken)?.userId;

  if (botToken && effectiveUserId && adminRoleId && adminRoleId !== "0") {
    try {
      const memberRes = await fetch(`https://discord.com/api/v10/guilds/${cleanGuildId}/members/${effectiveUserId}`, {
        headers: { Authorization: `Bot ${botToken}` },
        cache: 'no-store'
      });

      if (memberRes.ok) {
        const member = await memberRes.json();
        if (member.roles && member.roles.includes(adminRoleId)) {
          return true;
        }
      }
    } catch (roleErr) {
      console.error("[Permissions] Role check error:", roleErr);
    }
  }

  return false;
}

/**
 * Authoritative permission check via the Bot.
 */
export async function getBotPermissions(guildId: string | number, userId: string | number): Promise<GuildPermissions | null> {
  const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || "http://localhost:8080";
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

  try {
    const res = await fetch(`${BOT_WEBHOOK_URL}/guilds/${guildId}/permissions/${userId}`, {
      headers: { "x-webhook-secret": WEBHOOK_SECRET },
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("[Permissions] Bot permission fetch failed:", e);
  }
  return null;
}
