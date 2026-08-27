import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Card, Badge, Container, Stack, Text } from '../../ui';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
      <SEO title={t('legal.privacyTitle')} description={t('legal.privacySubtitle')} />

      <Stack gap="5xl">
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
      </Stack>
    </Container>
  );
};
