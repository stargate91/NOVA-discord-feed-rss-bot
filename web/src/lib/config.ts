import fs from 'fs';
import path from 'path';
import { GuildFeatures } from '@/types/guild';

let cachedConfig: Record<string, any> | null = null;

export function getConfig(): Record<string, any> {
  if (cachedConfig) return cachedConfig;

  try {
    const configPath = path.join(process.cwd(), '..', 'config.json');
    let finalPath = configPath;
    if (!fs.existsSync(finalPath)) {
      finalPath = path.join(process.cwd(), 'config.json');
    }

    const data = fs.readFileSync(finalPath, 'utf8');
    // Sanitize large IDs if necessary (JSON.parse can lose precision on 64-bit ints)
    const sanitizedData = data.replace(/:\s*([0-9]{15,})/g, ': "$1"');
    cachedConfig = JSON.parse(sanitizedData);
    return cachedConfig || {};
  } catch (e) {
    console.error("[Config] Failed to load config.json:", e);
    return {};
  }
}

export function isMasterGuild(guildId: string | number): boolean {
  const gIdStr = String(guildId);
  if (gIdStr === "1083433370815582240") return true; // Hardcoded safety fallback
  
  const config = getConfig();
  const masterGuilds = config.master_guilds || {};
  return Object.prototype.hasOwnProperty.call(masterGuilds, gIdStr);
}

/**
 * Normalizes the tier level considering premium expiration and master status.
 */
export function getEffectiveTier(tier: number | string, guildId: string | number | null = null, premiumUntil: string | null = null): number {
  if (guildId && isMasterGuild(guildId)) return 3; // Master is always Ultimate
  
  let effectiveTier = parseInt(String(tier), 10) || 0;
  
  // Fallback: If tier is 0 but premium is active, treat as Tier 3 (Ultimate)
  if (effectiveTier === 0 && premiumUntil && new Date(premiumUntil) > new Date()) {
    effectiveTier = 3;
  }
  
  return effectiveTier;
}

export function getGuildTierLimits(tier: number | string, guildId: string | number | null = null, premiumUntil: string | null = null): Record<string, any> {
  const config = getConfig();
  const effectiveTier = getEffectiveTier(tier, guildId, premiumUntil);
  const tierConfig = config.tier_config || {};
  return tierConfig[String(effectiveTier)] || tierConfig["0"] || {};
}

export function hasFeature(tier: number | string, guildId: string | number | null = null, featureName: string = "basic", premiumUntil: string | null = null): boolean {
  const tierInfo = getGuildTierLimits(tier, guildId, premiumUntil);
  const features = tierInfo.features || [];
  
  // Master Guilds bypass all feature locks
  if (guildId && isMasterGuild(guildId)) return true;
  
  return features.includes(featureName) || featureName === "basic";
}

export function resolveGuildFeatures(
  guildId: string | number | null = null,
  tier: number | string = 0,
  isMaster: boolean = false,
  premiumUntil: string | null = null
): GuildFeatures {
  const isMasterResult = Boolean(isMaster || (guildId && isMasterGuild(guildId)));
  const effectiveTier = isMasterResult ? 3 : getEffectiveTier(tier, guildId, premiumUntil);
  const tierInfo = getGuildTierLimits(effectiveTier, guildId, premiumUntil);
  const isPremium = isMasterResult || effectiveTier >= 1;

  const rawFeatures: string[] = tierInfo.features || [];
  const checkFeature = (name: string) => isMasterResult || rawFeatures.includes(name);

  return {
    tier: effectiveTier,
    tierName: isMasterResult ? "Master" : (tierInfo.name || "Free"),
    isMaster: isMasterResult,
    isPremium,
    maxMonitors: isMasterResult ? 1000 : (tierInfo.max_monitors ?? 2),
    minRefreshInterval: isMasterResult ? 1 : (tierInfo.min_refresh_interval ?? 20),
    maxPurge: isMasterResult ? 100 : (tierInfo.max_purge ?? 10),
    maxChannels: isMasterResult ? 50 : (tierInfo.max_channels ?? 1),
    maxPings: isMasterResult ? 50 : (tierInfo.max_pings ?? 1),
    canCustomColor: checkFeature("custom_color"),
    canAlertTemplate: checkFeature("alert_template"),
    canCustomTemplate: checkFeature("custom_template") || checkFeature("alert_template"),
    canGenreFilter: checkFeature("genre_filter"),
    canTmdbLanguageFilter: checkFeature("tmdb_language_filter"),
    canRemoveBranding: checkFeature("remove_branding"),
    canBulkImport: isMasterResult || effectiveTier >= 2,
    canBulkDelete: checkFeature("bulk_delete") || isMasterResult || effectiveTier >= 1,
    canRepost: checkFeature("repost") || isMasterResult,
    features: isMasterResult ? ["*"] : rawFeatures,
  };
}

