import React from 'react';
import { useParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedPath } from '@/components/layout/navConfig';
import { SEO, buildBreadcrumbListSchema } from '@/components/common/SEO';
import { OG_IMAGES } from '@/constants';
import { Card, Badge, Container, Stack, Text, Breadcrumbs } from '@/ui';
import { RelatedLinks } from '@/components/common/RelatedLinks/RelatedLinks';

export const PrivacyPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('common.navHome') || 'Home', href: getLocalizedPath('/', lang) },
    { label: t('legal.privacyTitle') || 'Privacy Policy' },
  ];

  const structuredData = [
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: `${t('legal.privacyTitle')} ${t('legal.privacyTitleHighlight')}`, url: '/privacy' },
    ]),
  ];

  return (
    <Container maxWidth="md" padding="md">
      <SEO
        title={t('legal.privacyTitle')}
        description={t('legal.privacySubtitle')}
        keywords="discord bot privacy policy, data protection, discord server security, encryption standards, data handling"
        image={OG_IMAGES.legal}
        imageAlt="Nova Feeds Privacy Policy and Data Security"
        structuredData={structuredData}
      />

      <Stack gap="5xl">
        <Breadcrumbs items={breadcrumbItems} />

        <Stack align="center" gap="md">
          <Badge variant="online" size="md" dot pulse>
            <Shield size={14} /> {t('legal.privacyTag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('legal.privacyTitle')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('legal.privacyTitleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('legal.privacySubtitle')}
            </Text>
          </Container>
        </Stack>

        <Stack gap="xl">
          <Card padding="xl" glow="blue">
            <Card.Header>
              <Card.Title>{t('legal.privacySection1Title')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Stack gap="md">
                <Text color="secondary">{t('legal.privacySection1Desc')}</Text>
                <Stack as="ul" gap="xs">
                  <Text as="li" size="sm" weight="semibold">
                    • {t('legal.privacyGuildInfo')}
                  </Text>
                  <Text as="li" size="sm" weight="semibold">
                    • {t('legal.privacyFeedInfo')}
                  </Text>
                  <Text as="li" size="sm" weight="semibold">
                    • {t('legal.privacyMetadataInfo')}
                  </Text>
                </Stack>
              </Stack>
            </Card.Body>
          </Card>

          <Card padding="xl">
            <Card.Header>
              <Card.Title>{t('legal.privacySection2Title')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text color="secondary">{t('legal.privacySection2Desc')}</Text>
            </Card.Body>
          </Card>

          <Card padding="xl">
            <Card.Header>
              <Card.Title>{t('legal.privacySection3Title')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text color="secondary">{t('legal.privacySection3Desc')}</Text>
            </Card.Body>
          </Card>
        </Stack>

        {/* Cross-linking & Related Resources */}
        <RelatedLinks current="legal" />
      </Stack>
    </Container>
  );
};

