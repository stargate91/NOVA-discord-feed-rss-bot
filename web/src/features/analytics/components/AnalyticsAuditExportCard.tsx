import React from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { FeatureGate } from '@/components/common/FeatureGate';
import { Card, Button, Inline, Text } from '@/ui';

export const AnalyticsAuditExportCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <FeatureGate
      tier="ultimate"
      featureName={t('guild.analyticsFeatureName')}
      description={t('guild.analyticsFeatureDesc')}
    >
      <Card
        glow="blue"
        title={t('guild.analyticsAuditExportTitle')}
        subtitle={t('guild.analyticsAuditExportSubtitle')}
      >
        <Inline justify="between" align="center" wrap gap="md">
          <Text size="xs" color="secondary">
            {t('guild.analyticsAuditArchiveReady')}
          </Text>
          <Button variant="primary" size="sm">
            <Download size={14} /> {t('guild.exportCsvBtn')}
          </Button>
        </Inline>
      </Card>
    </FeatureGate>
  );
};
