import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useToast } from '../../components/common/Toast';
import { Card, Button, Input, Badge } from '../../ui';
import styles from './AppPages.module.css';

export const GuildPremiumPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const [promoCode, setPromoCode] = useState<string>('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.warning('Please enter a valid promo code.', 'Input Required');
      return;
    }

    if (promoCode.trim().toLowerCase() === 'nova2026' || promoCode.trim().toLowerCase() === 'launch') {
      toast.success('Master Tier unlocked for 30 days!', 'Promo Code Applied');
      setPromoCode('');
    } else {
      toast.error('Invalid or expired promo code. Please check spelling.', 'Validation Error');
    }
  };

  const handleUpgradeCheckout = () => {
    toast.info('Redirecting to secure Stripe checkout portal...', 'Stripe Billing');
  };

  return (
    <div>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>{t('guild.premiumTitle')}</h2>
          <p className={styles.tabSubtitle}>
            {t('guild.premiumSubtitle', { guildId })}
          </p>
        </div>

        <Badge variant="online">{t('guild.activePlanBadge')}</Badge>
      </div>

      <div className={styles.grid2}>
        {/* Current Plan Status */}
        <Card title={t('guild.currentSubscriptionTitle')} subtitle={t('guild.currentSubscriptionSubtitle')}>
          <div className={styles.statRow}>
            <span>{t('guild.activeTierLabel')}</span>
            <span className={styles.statValue}>{t('guild.activeTierValue')}</span>
          </div>
          <div className={styles.statRow}>
            <span>Max Active Monitors</span>
            <span className={styles.statValue}>25 Monitors</span>
          </div>
          <div className={styles.statRow}>
            <span>{t('guild.refreshIntervalLabel')}</span>
            <span className={styles.statValue}>{t('guild.refreshIntervalValue', { seconds: 120 })}</span>
          </div>
          <div className={styles.statRow}>
            <span>Priority Queue Delivery</span>
            <span className={styles.statValue}>Enabled</span>
          </div>

          <div className={styles.btnContainer}>
            <Button
              variant="primary"
              fullWidth
              onClick={handleUpgradeCheckout}
            >
              Upgrade to Master Tier ($9.99/mo)
            </Button>
          </div>
        </Card>

        {/* Promo Code Redemption */}
        <Card title={t('guild.redeemPromoTitle')} subtitle={t('guild.redeemPromoSubtitle')}>
          <form className={styles.promoForm} onSubmit={handleApplyPromo}>
            <Input
              label={t('guild.promoCodeInputLabel')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={t('guild.promoCodePlaceholder')}
            />

            <Button type="submit" variant="secondary" fullWidth>
              {t('guild.applyPromoBtn')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
