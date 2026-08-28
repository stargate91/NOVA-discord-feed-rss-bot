import React from 'react';
import { useParams } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedPath } from '@/components/layout/navConfig';
import { SEO, buildBreadcrumbListSchema } from '@/components/common/SEO';
import { OG_IMAGES } from '@/constants';
import { Card, Badge, Container, Stack, Text, Breadcrumbs } from '@/ui';
import { RelatedLinks } from '@/components/common/RelatedLinks/RelatedLinks';

export const TermsPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('common.navHome') || 'Home', href: getLocalizedPath('/', lang) },
    { label: t('legal.termsTitle') || 'Terms of Service' },
  ];

  const structuredData = [
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: `${t('legal.termsTitle')} ${t('legal.termsTitleHighlight')}`, url: '/terms' },
    ]),
  ];

  return (
    <Container maxWidth="md" padding="md">
      <SEO
        title={t('legal.termsTitle')}
        description={t('legal.termsSubtitle')}
        keywords="discord bot terms of service, platform usage rules, bot terms and conditions, acceptable use policy"
        image={OG_IMAGES.legal}
        imageAlt="Nova Feeds Terms of Service and Platform Usage Guidelines"
        structuredData={structuredData}
      />

      <Stack gap="5xl">
        <Breadcrumbs items={breadcrumbItems} />

        <Stack align="center" gap="md">
          <Badge variant="outline" size="md" dot pulse>
            <Scale size={14} /> {t('legal.termsTag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('legal.termsTitle')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('legal.termsTitleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('legal.termsSubtitle')}
            </Text>
          </Container>
        </Stack>

        <Stack gap="xl">
          <Card padding="xl">
            <Card.Header>
              <Card.Title>{t('legal.termsSection1Title')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text color="secondary">{t('legal.termsSection1Desc')}</Text>
            </Card.Body>
          </Card>

          <Card padding="xl">
            <Card.Header>
              <Card.Title>{t('legal.termsSection2Title')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text color="secondary">{t('legal.termsSection2Desc')}</Text>
            </Card.Body>
          </Card>

          <Card padding="xl">
            <Card.Header>
              <Card.Title>{t('legal.termsSection3Title')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text color="secondary">{t('legal.termsSection3Desc')}</Text>
            </Card.Body>
          </Card>

          <Card padding="xl">
            <Card.Header>
              <Card.Title>{t('legal.termsSection4Title')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text color="secondary">{t('legal.termsSection4Desc')}</Text>
            </Card.Body>
          </Card>
        </Stack>

        {/* Cross-linking & Related Resources */}
        <RelatedLinks current="legal" />
      </Stack>
    </Container>
  );
};

