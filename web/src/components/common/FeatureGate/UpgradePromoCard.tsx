import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { GuildTier } from '../../../auth';
import { TIER_LABELS } from '../../../auth';
import { Badge, Button } from '../../../ui';
import styles from './FeatureGate.module.css';

interface UpgradePromoCardProps {
  requiredTier: GuildTier;
  featureName?: string;
  description?: string;
}

export const UpgradePromoCard: React.FC<UpgradePromoCardProps> = ({
  requiredTier,
  featureName = 'This feature',
  description,
}) => {
  const navigate = useNavigate();
  const { guildId } = useParams<{ guildId?: string }>();
  const tierName = TIER_LABELS[requiredTier] || `${requiredTier.toUpperCase()} Tier`;

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
        <Badge variant="tier">{tierName} Required</Badge>
      </div>

      <h4 className={styles.title}>
        Unlock {featureName}
      </h4>

      <p className={styles.description}>
        {description ||
          `This advanced functionality is exclusively available on the ${tierName} and above. Upgrade your Discord server to activate immediate access.`}
      </p>

      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={handleUpgradeClick}>
          Upgrade Server <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};
