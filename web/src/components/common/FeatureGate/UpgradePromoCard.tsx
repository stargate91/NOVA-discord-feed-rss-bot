import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { GuildTier } from '@/auth';
import { TIER_LABELS } from '@/auth';
import { useTranslation } from '@/i18n';
import { Badge, Button } from '@/ui';
import styles from './FeatureGate.module.css';

interface UpgradePromoCardProps {
  requiredTier: GuildTier;
  featureName?: string;
  description?: string;
}

export const UpgradePromoCard: React.FC<UpgradePromoCardProps> = ({
  requiredTier,
  featureName,
  description,
}) => {
  const navigate = useNavigate();
  const { guildId } = useParams<{ guildId?: string }>();
  const { t } = useTranslation();
  const tierName = TIER_LABELS[requiredTier] || `${requiredTier.toUpperCase()} Tier`;
  const resolvedFeatureName = featureName || t('common.defaultFeatureName');

  const handleUpgradeClick = () => {
    if (guildId) {
      navigate(`/dashboard/${guildId}/premium`);
    } else {
      navigate('/premium');
    }
  };

  return (
    <div className={styles.upgradeCard}>
      <div className={styles.iconCircle}>
        <Sparkles size={20} />
      </div>

      <div className={styles.badgeRow}>
        <Badge variant="tier">{t('common.tierRequired', { tier: tierName })}</Badge>
      </div>

      <h4 className={styles.title}>
        {t('common.unlockFeature', { feature: resolvedFeatureName })}
      </h4>

      <p className={styles.description}>
        {description || t('common.upgradePromoDefaultDesc', { tier: tierName })}
      </p>

      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={handleUpgradeClick}>
          {t('common.upgradeServerBtn')} <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};
