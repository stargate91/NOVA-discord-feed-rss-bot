import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Badge, Container, Stack, Text, SegmentedControl, Inline } from '@/ui';
import { PricingCardsGrid, PremiumFaqSection } from './premium';
import styles from './PremiumPage.module.css';

export const PremiumPage: React.FC = () => {
  const { t } = useTranslation();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const intervalOptions = [
    { value: 'month', label: t('premium.billingMonthly') },
    {
      value: 'year',
      label: (
        <Inline gap="xs" align="center">
          <span>{t('premium.billingYearly')}</span>
          <Badge variant="online" size="xs">
            {t('premium.billingYearlyDiscount')}
          </Badge>
        </Inline>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" padding="md">
      <SEO title={t('premium.tag')} description={t('premium.subtitle')} />

      <Stack gap="5xl">
        <Stack align="center" gap="md">
          <Badge variant="tier" size="md" dot pulse>
            <Sparkles size={14} /> {t('premium.tag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('premium.title')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('premium.titleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('premium.subtitle')}
            </Text>
          </Container>

          {/* Billing Interval Toggle (Monthly / Yearly) */}
          <Inline justify="center" align="center" className={styles.intervalToggleRow}>
            <SegmentedControl
              size="md"
              value={billingInterval}
              onChange={(val) => setBillingInterval(val as 'month' | 'year')}
              options={intervalOptions}
            />
          </Inline>
        </Stack>

        {/* 5-Tier Pricing Grid */}
        <PricingCardsGrid billingInterval={billingInterval} />

        {/* FAQ Section */}
        <PremiumFaqSection />
      </Stack>
    </Container>
  );
};
