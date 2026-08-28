import React from 'react';
import { useTranslation } from '@/i18n';
import {
  SEO,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildSoftwareApplicationSchema,
  buildFaqPageSchema,
} from '@/components/common/SEO';
import { OG_IMAGES } from '@/constants';
import { Stack } from '@/ui';
import {
  HeroSection,
  InteractiveEmbedPreview,
  FeaturesGridSection,
  DeliveryStatsSection,
  FaqSection,
  CtaBannerSection,
} from './home';

/**
 * Enterprise Marketing Home Page
 * Composed of modular, decoupled marketing sections.
 */
export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  const homeFaqs = [
    { question: t('home.faq1Question'), answer: t('home.faq1Answer') },
    { question: t('home.faq2Question'), answer: t('home.faq2Answer') },
    { question: t('home.faq3Question'), answer: t('home.faq3Answer') },
    { question: t('home.faq4Question'), answer: t('home.faq4Answer') },
    { question: t('home.faq5Question'), answer: t('home.faq5Answer') },
  ];

  const structuredData = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildFaqPageSchema(homeFaqs),
  ];

  return (
    <Stack gap="5xl">
      <SEO
        title={t('home.heroTitleHighlight')}
        description={t('home.heroDescription')}
        image={OG_IMAGES.home}
        imageAlt="Nova Feeds — Next-Generation Discord Notification Bot"
        structuredData={structuredData}
      />



      <HeroSection />
      <InteractiveEmbedPreview />
      <FeaturesGridSection />
      <DeliveryStatsSection />
      <FaqSection />
      <CtaBannerSection />
    </Stack>
  );
};
