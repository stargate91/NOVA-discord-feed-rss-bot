import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Clock, Hash, Shield, Save } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import {
  Card,
  Button,
  Select,
  Input,
  Field,
  Switch,
  Stack,
  Inline,
  Grid,
  Text,
  type SelectOption,
} from '@/ui';

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English (US)' },
  { value: 'hu', label: 'Magyar (Hungarian)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'zh', label: '简体中文 (Simplified Chinese)' },
  { value: 'zh-tw', label: '繁體中文 (Traditional Chinese)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'nl', label: 'Nederlands (Dutch)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'cs', label: 'Čeština (Czech)' },
  { value: 'sv', label: 'Svenska (Swedish)' },
];

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
  { value: 'Europe/Budapest', label: 'Europe/Budapest (CET / CEST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT / BST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET / CEST)' },
  { value: 'America/New_York', label: 'America/New_York (EST / EDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST / PDT)' },
];

export const GuildSettingsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const [locale, setLocale] = useState<string>('en');
  const [timezone, setTimezone] = useState<string>('UTC');
  const [logChannel, setLogChannel] = useState<string>('123456789');
  const [autoIsolate, setAutoIsolate] = useState<boolean>(true);
  const [debugLogs, setDebugLogs] = useState<boolean>(false);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    toast.success(t('guild.toastSettingsSaved'), t('guild.toastSettingsSavedTitle'));
  };

  return (
    <Stack gap="xl">
      <Inline justify="between" align="center" wrap gap="md">
        <Stack gap="3xs">
          <Text as="h2" size="lg" weight="bold">
            {t('guild.settingsTitle')}
          </Text>
          <Text size="xs" color="secondary">
            {t('guild.settingsSubtitle', { guildId })}
          </Text>
        </Stack>

        <Button variant="primary" onClick={handleSave}>
          <Save size={14} /> {t('guild.saveChangesBtn')}
        </Button>
      </Inline>

      <Grid minItemWidth="md" gap="lg">
        {/* Localization & Region */}
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
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  searchable
                  searchPlaceholder={t('guild.searchLanguagePlaceholder')}
                  options={LANGUAGE_OPTIONS}
                />
              </Field>

              <Field label={t('guild.timezoneLabel')} hint={t('guild.timezoneHint')}>
                <Select
                  leftIcon={<Clock size={15} />}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  searchable
                  searchPlaceholder={t('guild.searchTimezonePlaceholder')}
                  options={TIMEZONE_OPTIONS}
                />
              </Field>

              <Switch
                label={t('guild.autoIsolateLabel')}
                description={t('guild.autoIsolateDesc')}
                checked={autoIsolate}
                onChange={setAutoIsolate}
                color="primary"
              />
            </Stack>
          </form>
        </Card>

        {/* Audit Logging & Diagnostic Health */}
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
                  value={logChannel}
                  onChange={(e) => setLogChannel(e.target.value)}
                  placeholder={t('guild.errorChannelPlaceholder')}
                  copyable
                  clearable
                />
              </Field>

              <Switch
                label={t('guild.debugLogsLabel')}
                description={t('guild.debugLogsDesc')}
                checked={debugLogs}
                onChange={setDebugLogs}
                color="primary"
              />

              <Button type="submit" variant="secondary" fullWidth size="lg">
                <Shield size={14} /> {t('guild.updateLogChannelBtn')}
              </Button>
            </Stack>
          </form>
        </Card>
      </Grid>
    </Stack>
  );
};
