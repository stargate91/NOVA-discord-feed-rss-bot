import React from 'react';
import { Zap, Gift, Sparkles } from 'lucide-react';
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
        <Card glow="blue">
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

        <Card glow="green">
          <Card.Header>
            <Card.Title>{t('home.featureReliabilityTitle')}</Card.Title>
            <Card.Actions>
              <Gift size={18} color="var(--status-success)" />
            </Card.Actions>
          </Card.Header>
          <Card.Description>{t('home.featureReliabilitySubtitle')}</Card.Description>
          <Card.Body>
            <Text size="sm" color="secondary">
              {t('home.featureReliabilityDesc')}
            </Text>
          </Card.Body>
        </Card>

        <Card glow="purple">
          <Card.Header>
            <Card.Title>{t('home.featureLayoutsTitle')}</Card.Title>
            <Card.Actions>
              <Sparkles size={18} color="var(--status-purple)" />
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
