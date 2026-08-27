import React from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Grid } from '@/ui';
import {
  SettingsPageHeader,
  LocalizationSettingsCard,
  AuditLoggingSettingsCard,
  useGuildSettingsForm,
} from '@/features/settings';

export const GuildSettingsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const settingsForm = useGuildSettingsForm(guildId);

  return (
    <Stack gap="xl">
      <SettingsPageHeader
        guildId={guildId}
        onSave={settingsForm.handleSave}
        isSaving={settingsForm.isSaving}
      />

      <Grid minItemWidth="md" gap="lg">
        {/* Localization & Region */}
        <LocalizationSettingsCard form={settingsForm} />

        {/* Audit Logging & Diagnostic Health */}
        <AuditLoggingSettingsCard form={settingsForm} />
      </Grid>
    </Stack>
  );
};
