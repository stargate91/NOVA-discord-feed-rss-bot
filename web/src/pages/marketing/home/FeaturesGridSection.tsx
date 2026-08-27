import React from 'react';
import { Zap, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Stack, Text, Container, Grid, Card } from '@/ui';

export const FeaturesGridSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack gap="xl">
      <Stack align="center" gap="2xs">
        <Text as="h2" size="2xl" weight="bold" align="center">
          {t('home.scaleSpeedTitle')}
        </Text>
        <Container maxWidth="sm" centered>
          <Text size="sm" color="secondary" align="center">
            {t('home.scaleSpeedDesc')}
          </Text>
        </Container>
      </Stack>

      <Grid minItemWidth="md" gap="xl">
        <Card glow="blue" interactive>
          <Card.Header>
            <Card.Title>{t('home.featureRealtimeTitle')}</Card.Title>
            <Card.Actions>
              <Zap size={18} color="var(--blue-400)" />
            </Card.Actions>
          </Card.Header>
          <Card.Description>{t('home.featureRealtimeSubtitle')}</Card.Description>
          <Card.Body>
            <Text size="sm" color="secondary">
              {t('home.featureRealtimeDesc')}
            </Text>
          </Card.Body>
        </Card>

        <Card glow="green" interactive>
          <Card.Header>
            <Card.Title>{t('home.featureReliabilityTitle')}</Card.Title>
            <Card.Actions>
              <ShieldCheck size={18} color="var(--status-success)" />
            </Card.Actions>
          </Card.Header>
          <Card.Description>{t('home.featureReliabilitySubtitle')}</Card.Description>
          <Card.Body>
            <Text size="sm" color="secondary">
              {t('home.featureReliabilityDesc')}
            </Text>
          </Card.Body>
        </Card>

        <Card glow="purple" interactive>
          <Card.Header>
            <Card.Title>{t('home.featureLayoutsTitle')}</Card.Title>
            <Card.Actions>
              <SlidersHorizontal size={18} color="var(--status-purple)" />
            </Card.Actions>
          </Card.Header>
          <Card.Description>{t('home.featureLayoutsSubtitle')}</Card.Description>
          <Card.Body>
            <Text size="sm" color="secondary">
              {t('home.featureLayoutsDesc')}
            </Text>
          </Card.Body>
        </Card>
      </Grid>
    </Stack>
  );
};
