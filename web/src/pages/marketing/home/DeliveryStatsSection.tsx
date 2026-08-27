import React from 'react';
import { Clock, Cpu, Zap } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Grid, Card, Stack, Text, ProgressBar } from '@/ui';

export const DeliveryStatsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Grid minItemWidth="sm" gap="lg">
      <Card>
        <Card.Header>
          <Card.Title>{t('home.statLatencyTitle')}</Card.Title>
          <Card.Actions>
            <Clock size={16} color="var(--blue-400)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="sm">
          <Text size="3xl" weight="black">
            {t('home.statLatencyValue')}
          </Text>
          <ProgressBar
            value={92}
            size="sm"
            variant="brand"
            label={t('home.statLatencyLabel')}
            showValue
            valueFormat={() => t('home.statLatencyProgress')}
          />
        </Stack>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>{t('home.statPollingTitle')}</Card.Title>
          <Card.Actions>
            <Cpu size={16} color="var(--status-success)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="sm">
          <Text size="3xl" weight="black">
            {t('home.statPollingValue')}
          </Text>
          <ProgressBar
            value={99.98}
            size="sm"
            variant="success"
            label={t('home.statPollingLabel')}
            showValue
            valueFormat={() => t('home.statPollingProgress')}
          />
        </Stack>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>{t('home.statQuotaTitle')}</Card.Title>
          <Card.Actions>
            <Zap size={16} color="var(--status-warning)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="sm">
          <Text size="3xl" weight="black">
            {t('home.statQuotaValue')}
          </Text>
          <ProgressBar
            value={42}
            size="sm"
            variant="brand"
            label={t('home.statQuotaLabel')}
            showValue
            valueFormat={() => t('home.statQuotaProgress')}
          />
        </Stack>
      </Card>
    </Grid>
  );
};
