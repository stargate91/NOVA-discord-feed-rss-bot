import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import { DEFAULT_GUILD_SETTINGS } from '../constants';
import type { GuildSettings, UseGuildSettingsFormReturn } from '../types';

export const useGuildSettingsForm = (
  _guildId: string,
  initialSettings?: Partial<GuildSettings>
): UseGuildSettingsFormReturn => {
  const { t } = useTranslation();
  const toast = useToast();

  const [locale, setLocale] = useState<string>(
    initialSettings?.language || DEFAULT_GUILD_SETTINGS.language
  );
  const [timezone, setTimezone] = useState<string>(
    initialSettings?.timezone || DEFAULT_GUILD_SETTINGS.timezone
  );
  const [logChannel, setLogChannel] = useState<string>(
    initialSettings?.log_channel_id || DEFAULT_GUILD_SETTINGS.log_channel_id || ''
  );
  const [autoIsolate, setAutoIsolate] = useState<boolean>(
    initialSettings?.auto_isolate_dead_channels ?? DEFAULT_GUILD_SETTINGS.auto_isolate_dead_channels
  );
  const [debugLogs, setDebugLogs] = useState<boolean>(
    initialSettings?.debug_logging_enabled ?? DEFAULT_GUILD_SETTINGS.debug_logging_enabled
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsSaving(true);
      try {
        // Mock save delay simulation
        toast.success(t('guild.toastSettingsSaved'), t('guild.toastSettingsSavedTitle'));
      } finally {
        setIsSaving(false);
      }
    },
    [t, toast]
  );

  const formState = useMemo(
    () => ({
      locale,
      timezone,
      logChannel,
      autoIsolate,
      debugLogs,
    }),
    [locale, timezone, logChannel, autoIsolate, debugLogs]
  );

  return {
    formState,
    setLocale,
    setTimezone,
    setLogChannel,
    setAutoIsolate,
    setDebugLogs,
    handleSave,
    isSaving,
  };
};
