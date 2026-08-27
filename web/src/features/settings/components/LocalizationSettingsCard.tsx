import React from 'react';
import { Globe, Clock } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Select, Field, Switch, Stack } from '@/ui';
import { GUILD_LANGUAGE_OPTIONS, GUILD_TIMEZONE_OPTIONS } from '../constants';
import type { UseGuildSettingsFormReturn } from '../types';

interface LocalizationSettingsCardProps {
  form: UseGuildSettingsFormReturn;
}

export const LocalizationSettingsCard: React.FC<LocalizationSettingsCardProps> = ({ form }) => {
  const { t } = useTranslation();
  const { formState, setLocale, setTimezone, setAutoIsolate, handleSave } = form;

  return (
    <Card
      glow="blue"
      padding="xl"
      title={t('guild.localizationTitle')}
      subtitle={t('guild.localizationSubtitle')}
    >
      <form onSubmit={handleSave}>
        <Stack gap="md">
          <Field label={t('guild.botLanguageLabel')} hint={t('guild.botLanguageHint')}>
            <Select
              leftIcon={<Globe size={15} />}
              value={formState.locale}
              onChange={(e) => setLocale(e.target.value)}
              searchable
              searchPlaceholder={t('guild.searchLanguagePlaceholder')}
              options={GUILD_LANGUAGE_OPTIONS}
            />
          </Field>

          <Field label={t('guild.timezoneLabel')} hint={t('guild.timezoneHint')}>
            <Select
              leftIcon={<Clock size={15} />}
              value={formState.timezone}
              onChange={(e) => setTimezone(e.target.value)}
              searchable
              searchPlaceholder={t('guild.searchTimezonePlaceholder')}
              options={GUILD_TIMEZONE_OPTIONS}
            />
          </Field>

          <Switch
            label={t('guild.autoIsolateLabel')}
            description={t('guild.autoIsolateDesc')}
            checked={formState.autoIsolate}
            onChange={setAutoIsolate}
            color="primary"
          />
        </Stack>
      </form>
    </Card>
  );
};
