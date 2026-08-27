import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Stack, Button, ProgressBar } from '@/ui';

export const MetricsTelemetryCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card glow="purple" title={t('dev.prometheusTitle')} subtitle={t('dev.prometheusSubtitle')}>
      <Stack gap="md">
        <Button variant="secondary" size="sm" onClick={() => window.open('/metrics', '_blank')}>
          <ExternalLink size={14} /> {t('dev.viewMetricsBtn')}
        </Button>
        <ProgressBar
          value={98}
          size="sm"
          variant="purple"
          label={t('dev.metricHealthLabel')}
          showValue
          valueFormat={() => t('dev.uptimeHealth')}
        />
      </Stack>
    </Card>
  );
};
