import React from 'react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Stack } from '@/ui';
import {
  HeroSection,
  SupportedPlatformsSection,
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

  return (
    <Stack gap="5xl">
      <SEO title={t('home.heroTitleHighlight')} description={t('home.heroDescription')} />

      <HeroSection />
      <SupportedPlatformsSection />
      <InteractiveEmbedPreview />
      <FeaturesGridSection />
      <DeliveryStatsSection />
      <FaqSection />
      <CtaBannerSection />
    </Stack>
  );
};
