import React from 'react';
import { Scale } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Card, Badge, Container, Stack, Text } from '@/ui';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
      <SEO title={t('legal.termsTitle')} description={t('legal.termsSubtitle')} />

      <Stack gap="5xl">
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
      </Stack>
    </Container>
  );
};
