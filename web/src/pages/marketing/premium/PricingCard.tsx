import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { TranslationKey } from '@/i18n';
import { useTranslation } from '@/i18n';
import type { CardGlow, BadgeProps, ButtonProps } from '@/ui';
import { Card, Stack, Inline, Text, Badge, Button } from '@/ui';

export interface PricingPlanConfig {
  id: string;
  glow?: CardGlow;
  interactive?: boolean;
  badgeVariant?: BadgeProps['variant'];
  titleKey: TranslationKey;
  pillKey?: TranslationKey;
  priceKey: TranslationKey;
  pricePeriodKey: TranslationKey;
  descKey: TranslationKey;
  featureKeys: TranslationKey[];
  ctaVariant?: ButtonProps['variant'];
  ctaKey: TranslationKey;
}

export interface PricingCardProps {
  plan: PricingPlanConfig;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card
      glow={plan.glow || 'none'}
      interactive={plan.interactive}
      padding="xl"
    >
      <Stack gap="lg" justify="between">
        <Stack gap="sm">
          <Inline justify="between" align="center">
            <Badge variant={plan.badgeVariant}>{t(plan.titleKey)}</Badge>
            {plan.pillKey && <Badge variant="tier">{t(plan.pillKey)}</Badge>}
          </Inline>

          <Inline align="baseline" gap="xs">
            <Text size="4xl" weight="black">
              {t(plan.priceKey)}
            </Text>
            <Text size="sm" color="muted">
              {t(plan.pricePeriodKey)}
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

        <Button
          variant={plan.ctaVariant}
          fullWidth
          onClick={() => navigate('/servers')}
        >
          {t(plan.ctaKey)}
        </Button>
      </Stack>
    </Card>
  );
};
