import pool from "./db";
import { GuildInfo, GuildPermissions } from "@/types/guild";
import { MemoryCache } from "./cache";
import { sanitizeGuildId, hasGuildManagementPermission } from "@/utils/discord";

// In-memory cache for user guilds to prevent Discord rate limits (429)
const guildCache = new MemoryCache(30000); // 30 seconds

/**
 * Fetches user guilds from Discord with caching, deduplication, and rate-limit handling.
 */
export async function getUserGuilds(session: any): Promise<GuildInfo[] | null> {
  if (!session || !session.accessToken) return null;

  let userId = session.user?.id;
  const cacheKey = userId || session.accessToken;

  return guildCache.getOrFetch(
    cacheKey,
    async (): Promise<GuildInfo[] | null> => {
      try {
        // --- Fallback: If userId is missing, fetch it from @me ---
        if (!userId) {
          try {
            const userRes = await fetch("https://discord.com/api/users/@me", {
              headers: { Authorization: `Bearer ${session.accessToken}` },
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
          cache: "no-store",
        });

        if (discordRes.ok) {
          const userGuilds: GuildInfo[] = await discordRes.json();
          return userGuilds;
        }

        return null;
      } catch (error) {
        console.error("[Permissions] Fetch Error:", error);
        return null;
      }
    },
    30000
  );
}


/**
 * Checks if a user has permission to manage a specific guild.
 */
export async function canManageGuild(session: any, guildId: string | number): Promise<boolean> {
  if (!session) return false;

  // 1. Master users can manage everything
  if (session.user?.role === "master") return true;

  if (!guildId) return false;
  const cleanGuildId = sanitizeGuildId(guildId);
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
      const allowed = hasGuildManagementPermission(guild.permissions, Boolean(guild.owner));
      if (allowed) {
        return true;
      }
    }
  }

  // Fallback: Check for specific Admin Role via Bot Token
  const botToken = process.env.BOT_TOKEN;
  const effectiveUserId = session.user?.id;

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
