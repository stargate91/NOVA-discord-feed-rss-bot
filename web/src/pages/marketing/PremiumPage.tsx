import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Badge, Container, Stack, Text } from '@/ui';
import { PricingCardsGrid, PremiumFaqSection } from './premium';

export const PremiumPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
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
        </Stack>

        {/* Pricing Grid */}
        <PricingCardsGrid />

        {/* FAQ Section */}
        <PremiumFaqSection />
      </Stack>
    </Container>
  );
};
