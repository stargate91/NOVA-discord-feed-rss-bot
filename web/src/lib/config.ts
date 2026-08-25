import fs from 'fs';
import path from 'path';
import { GuildFeatures } from '@/types/guild';
import { TIER_DEFINITIONS, MASTER_TIER_LIMITS } from '@/constants/tiers';

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

  const fallbackTierDef = TIER_DEFINITIONS[effectiveTier] || TIER_DEFINITIONS[0];
  const fallbackLimits = isMasterResult
    ? MASTER_TIER_LIMITS
    : fallbackTierDef.limits;

  const rawFeatures: string[] = tierInfo.features || [];
  const checkFeature = (name: string, fallbackFlag?: boolean) =>
    isMasterResult || rawFeatures.includes(name) || Boolean(fallbackFlag);

  return {
    tier: effectiveTier,
    tierName: isMasterResult ? "Master" : (tierInfo.name || fallbackTierDef.title || "Free"),
    isMaster: isMasterResult,
    isPremium,
    maxMonitors: isMasterResult ? MASTER_TIER_LIMITS.maxMonitors : (tierInfo.max_monitors ?? fallbackLimits.maxMonitors),
    minRefreshInterval: isMasterResult ? MASTER_TIER_LIMITS.minRefreshInterval : (tierInfo.min_refresh_interval ?? fallbackLimits.minRefreshInterval),
    maxPurge: isMasterResult ? MASTER_TIER_LIMITS.maxPurge : (tierInfo.max_purge ?? fallbackLimits.maxPurge),
    maxChannels: isMasterResult ? MASTER_TIER_LIMITS.maxChannels : (tierInfo.max_channels ?? fallbackLimits.maxChannels),
    maxPings: isMasterResult ? MASTER_TIER_LIMITS.maxPings : (tierInfo.max_pings ?? fallbackLimits.maxPings),
    canCustomColor: checkFeature("custom_color", fallbackTierDef.canCustomColor),
    canAlertTemplate: checkFeature("alert_template", fallbackTierDef.canAlertTemplate),
    canCustomTemplate: checkFeature("custom_template", fallbackTierDef.canCustomTemplate) || checkFeature("alert_template", fallbackTierDef.canAlertTemplate),
    canGenreFilter: checkFeature("genre_filter", fallbackTierDef.canGenreFilter),
    canTmdbLanguageFilter: checkFeature("tmdb_language_filter", fallbackTierDef.canTmdbLanguageFilter),
    canRemoveBranding: checkFeature("remove_branding", fallbackTierDef.canRemoveBranding),
    canBulkImport: checkFeature("bulk_import", fallbackTierDef.canBulkImport),
    canBulkDelete: checkFeature("bulk_delete", fallbackTierDef.canBulkDelete),
    canRepost: checkFeature("repost", fallbackTierDef.canRepost),
    features: isMasterResult ? ["*"] : rawFeatures,
  };
}

