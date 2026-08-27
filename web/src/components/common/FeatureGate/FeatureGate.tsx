import type { ReactNode } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import type { GuildTier } from '@/auth';
import { hasTierAccess } from '@/auth';
import { useGuild } from '@/guild';
import { UpgradePromoCard } from './UpgradePromoCard';

export interface FeatureGateProps {
  tier: GuildTier;
  currentTier?: GuildTier;
  featureName?: string;
  description?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  tier,
  currentTier,
  featureName,
  description,
  fallback,
  children,
}) => {
  const { guilds } = useGuild();
  const { guildId } = useParams<{ guildId?: string }>();

  // Determine effective guild tier
  let resolvedTier: GuildTier = currentTier || 'free';

  if (!currentTier && guildId) {
    const foundGuild = guilds.find((g) => g.id === guildId);
    if (foundGuild?.tier) {
      resolvedTier = foundGuild.tier;
    } else {
      resolvedTier = 'free';
    }
  }

  const hasAccess = hasTierAccess(resolvedTier, tier);

  if (!hasAccess) {
    if (fallback !== undefined) {
      return fallback ? <>{fallback}</> : null;
    }
    return (
      <UpgradePromoCard requiredTier={tier} featureName={featureName} description={description} />
    );
  }

  return <>{children}</>;
};
