import React from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Stack, Inline, Text, Button } from '@/ui';

interface SettingsPageHeaderProps {
  guildId: string;
  onSave: () => void;
  isSaving?: boolean;
}

export const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  guildId,
  onSave,
  isSaving = false,
}) => {
  const { t } = useTranslation();

  return (
    <Inline justify="between" align="center" wrap gap="md">
      <Stack gap="3xs">
        <Text as="h2" size="lg" weight="bold">
          {t('guild.settingsTitle')}
        </Text>
        <Text size="xs" color="secondary">
          {t('guild.settingsSubtitle', { guildId })}
        </Text>
      </Stack>

      <Button variant="primary" onClick={onSave} disabled={isSaving}>
        <Save size={14} /> {t('guild.saveChangesBtn')}
      </Button>
    </Inline>
  );
};
