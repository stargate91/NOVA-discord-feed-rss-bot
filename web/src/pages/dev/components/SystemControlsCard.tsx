import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Stack, Inline, Button, Text, ProgressBar } from '@/ui';

export interface SystemControlsCardProps {
  onForceSync: () => Promise<void>;
  syncStatus?: string;
  isSyncing?: boolean;
}

export const SystemControlsCard: React.FC<SystemControlsCardProps> = ({
  onForceSync,
  syncStatus,
  isSyncing = false,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      glow="blue"
      title={t('dev.systemControlsTitle')}
      subtitle={t('dev.systemControlsSubtitle')}
    >
      <Stack gap="md">
        <Inline align="center" gap="md">
          <Button variant="secondary" size="sm" onClick={onForceSync} disabled={isSyncing}>
            <RefreshCw size={14} /> {t('dev.forceSyncBtn')}
          </Button>
          {syncStatus && (
            <Text size="sm" color="brand">
              {syncStatus}
            </Text>
          )}
        </Inline>
        <ProgressBar
          value={100}
          size="sm"
          variant="brand"
          label={t('dev.cacheCoherencyLabel')}
          showValue
          valueFormat={() => t('dev.synchronized')}
        />
      </Stack>
    </Card>
  );
};
