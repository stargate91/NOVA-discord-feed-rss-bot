import React from 'react';
import { Hash, Shield } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Button, Input, Field, Switch, Stack } from '@/ui';
import type { UseGuildSettingsFormReturn } from '../types';

interface AuditLoggingSettingsCardProps {
  form: UseGuildSettingsFormReturn;
}

export const AuditLoggingSettingsCard: React.FC<AuditLoggingSettingsCardProps> = ({ form }) => {
  const { t } = useTranslation();
  const { formState, setLogChannel, setDebugLogs, handleSave } = form;

  return (
    <Card
      glow="purple"
      padding="xl"
      title={t('guild.auditLoggingTitle')}
      subtitle={t('guild.auditLoggingSubtitle')}
    >
      <form onSubmit={handleSave}>
        <Stack gap="md">
          <Field label={t('guild.errorChannelLabel')} hint={t('guild.errorChannelHint')}>
            <Input
              leftIcon={<Hash size={15} />}
              value={formState.logChannel}
              onChange={(e) => setLogChannel(e.target.value)}
              placeholder={t('guild.errorChannelPlaceholder')}
              copyable
              clearable
            />
          </Field>

          <Switch
            label={t('guild.debugLogsLabel')}
            description={t('guild.debugLogsDesc')}
            checked={formState.debugLogs}
            onChange={setDebugLogs}
            color="primary"
          />

          <Button type="submit" variant="secondary" fullWidth size="lg">
            <Shield size={14} /> {t('guild.updateLogChannelBtn')}
          </Button>
        </Stack>
      </form>
    </Card>
  );
};
