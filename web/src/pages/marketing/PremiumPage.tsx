import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { getLocalizedPath } from '@/components/layout/navConfig';
import {
  SEO,
  buildPremiumProductSchema,
  buildFaqPageSchema,
  buildBreadcrumbListSchema,
} from '@/components/common/SEO';
import { OG_IMAGES } from '@/constants';
import { Badge, Container, Stack, Text, SegmentedControl, Inline, Breadcrumbs } from '@/ui';
import { RelatedLinks } from '@/components/common/RelatedLinks/RelatedLinks';
import { PricingCardsGrid, TierComparisonTable, PremiumFaqSection } from './premium';
import styles from './PremiumPage.module.css';

export const PremiumPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
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

  const premiumFaqs = [
    { question: t('premium.faqQ1'), answer: t('premium.faqA1') },
    { question: t('premium.faqQ2'), answer: t('premium.faqA2') },
  ];

  const breadcrumbItems = [
    { label: t('common.navHome') || 'Home', href: getLocalizedPath('/', lang) },
    { label: t('common.navPremium') || 'Premium' },
  ];

  const structuredData = [
    buildPremiumProductSchema(),
    buildFaqPageSchema(premiumFaqs),
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: t('common.navPremium'), url: '/premium' },
    ]),
  ];

  return (
    <Container maxWidth="xl" padding="md">
      <SEO
        title={`${t('premium.title')} ${t('premium.titleHighlight')}`}
        description={t('premium.subtitle')}
        keywords="discord bot premium, fast social feeds, real-time alerts, priority queue, custom discord embeds, unlimited monitors"
        image={OG_IMAGES.premium}
        imageAlt="Nova Feeds Premium Subscription Plans and Features"
        structuredData={structuredData}
      />

      <Stack gap="5xl">
        <Breadcrumbs items={breadcrumbItems} />

        <Stack align="center" gap="md">
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

        {/* Pricing Cards Grid (4 Tiers) */}
        <PricingCardsGrid billingInterval={billingInterval} />

        {/* Side-by-side Tier Comparison Table */}
        <TierComparisonTable />

        {/* FAQ Section */}
        <PremiumFaqSection />

        {/* Cross-linking & Related Resources */}
        <RelatedLinks current="premium" />
      </Stack>
    </Container>
  );
};


