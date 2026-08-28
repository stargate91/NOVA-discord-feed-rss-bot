import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { TranslationKey } from '@/i18n';
import { useTranslation } from '@/i18n';
import type { CardGlow, BadgeProps, ButtonProps } from '@/ui';
import { Card, Stack, Inline, Text, Badge, Button } from '@/ui';
import styles from './PricingCard.module.css';

export interface PricingPlanConfig {
  id: string;
  glow?: CardGlow;
  interactive?: boolean;
  badgeVariant?: BadgeProps['variant'];
  titleKey: TranslationKey;
  pillKey?: TranslationKey;
  priceMonthlyKey: TranslationKey;
  priceYearlyKey: TranslationKey;
  descKey: TranslationKey;
  featureKeys: TranslationKey[];
  ctaVariant?: ButtonProps['variant'];
  ctaKey: TranslationKey;
  isBuyable?: boolean;
  disabledNoteKey?: TranslationKey;
}

export interface PricingCardProps {
  plan: PricingPlanConfig;
  billingInterval?: 'month' | 'year';
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, billingInterval = 'month' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const priceKey = billingInterval === 'year' ? plan.priceYearlyKey : plan.priceMonthlyKey;
  const periodText =
    plan.id === 'master'
      ? t('premium.masterPricePeriod')
      : billingInterval === 'year'
        ? t('premium.perYear')
        : t('premium.perMonth');

  return (
    <Card glow={plan.glow || 'none'} interactive={plan.interactive} padding="xl">
      <Stack gap="lg" justify="between" className={styles.cardContent}>
        <Stack gap="sm">
          <Inline justify="between" align="center">
            <Badge variant={plan.badgeVariant}>{t(plan.titleKey)}</Badge>
            {plan.pillKey && <Badge variant="tier">{t(plan.pillKey)}</Badge>}
          </Inline>

          <Inline align="baseline" gap="xs">
            <Text size="4xl" weight="black">
              {t(priceKey)}
            </Text>
            <Text size="sm" color="muted">
              {periodText}
            </Text>
          </Inline>

          <Text size="sm" color="secondary">
            {t(plan.descKey)}
          </Text>

          <Stack as="ul" gap="sm">
            {plan.featureKeys.map((featureKey) => (
              <Inline key={featureKey} as="li" gap="sm" align="center">
                <Check size={14} color="var(--status-success)" />
                <Text size="sm">{t(featureKey)}</Text>
              </Inline>
            ))}
          </Stack>
        </Stack>

        <Stack gap="2xs">
          {plan.isBuyable !== false ? (
            <Button
              as="a"
              href="/servers"
              variant={plan.ctaVariant}
              fullWidth
              onClick={(e) => {
                e.preventDefault();
                navigate('/servers');
              }}
            >
              {t(plan.ctaKey)}
            </Button>
          ) : (
            <Button variant="secondary" fullWidth disabled className={styles.disabledCtaBtn}>
              {t(plan.ctaKey)}
            </Button>
          )}
          {plan.disabledNoteKey && (
            <Text size="3xs" color="muted" align="center">
              {t(plan.disabledNoteKey)}
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
