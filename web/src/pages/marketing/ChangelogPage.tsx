import React from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedPath } from '@/components/layout/navConfig';
import { SEO, buildBreadcrumbListSchema } from '@/components/common/SEO';
import { OG_IMAGES } from '@/constants';
import { Card, Badge, Container, Stack, Text, Breadcrumbs } from '@/ui';
import { RelatedLinks } from '@/components/common/RelatedLinks/RelatedLinks';

export const ChangelogPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('common.navHome') || 'Home', href: getLocalizedPath('/', lang) },
    { label: t('common.navChangelog') || 'Changelog' },
  ];

  const structuredData = [
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: t('common.navChangelog'), url: '/changelog' },
    ]),
  ];

  return (
    <Container maxWidth="md" padding="md">
      <SEO
        title={`${t('changelog.title')} ${t('changelog.titleHighlight')}`}
        description={t('changelog.subtitle')}
        keywords="discord bot changelog, nova updates, release notes, new bot features, version history, bot patch notes"
        image={OG_IMAGES.changelog}
        imageAlt="Nova Feeds Feature Drops and Version Changelog"
        structuredData={structuredData}
      />

      <Stack gap="5xl">
        <Breadcrumbs items={breadcrumbItems} />

        <Stack align="center" gap="md">
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('changelog.title')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('changelog.titleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('changelog.subtitle')}
            </Text>
          </Container>
        </Stack>

        <Stack gap="xl">
          {/* Release v1.0.0 */}
          <Card
            glow="blue"
            interactive
            padding="xl"
            title={t('changelog.v100Title')}
            subtitle={t('changelog.v100Subtitle')}
            action={
              <Badge variant="online" dot pulse>
                <Sparkles size={12} /> {t('changelog.v100Badge')}
              </Badge>
            }
          >
            <Stack gap="md">
              <Text color="secondary">{t('changelog.v100Desc')}</Text>
              <Stack as="ul" gap="xs">
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature1')}
                </Text>
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature2')}
                </Text>
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature3')}
                </Text>
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature4')}
                </Text>
              </Stack>
            </Stack>
          </Card>

          {/* Release v0.9.0 */}
          <Card
            padding="xl"
            title={t('changelog.v090Title')}
            subtitle={t('changelog.v090Subtitle')}
            action={<Badge variant="neutral">{t('changelog.v090Badge')}</Badge>}
          >
            <Stack as="ul" gap="xs">
              <Text as="li" size="sm" weight="semibold">
                • {t('changelog.v090Feature1')}
              </Text>
              <Text as="li" size="sm" weight="semibold">
                • {t('changelog.v090Feature2')}
              </Text>
              <Text as="li" size="sm" weight="semibold">
                • {t('changelog.v090Feature3')}
              </Text>
            </Stack>
          </Card>
        </Stack>

        {/* Cross-linking & Related Resources */}
        <RelatedLinks current="changelog" />
      </Stack>
    </Container>
  );
};

