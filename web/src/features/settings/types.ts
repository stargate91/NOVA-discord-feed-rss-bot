import type { GuildSettings } from '@/types';

export interface GuildSettingsFormState {
  locale: string;
  timezone: string;
  logChannel: string;
  autoIsolate: boolean;
  debugLogs: boolean;
}

export interface UseGuildSettingsFormReturn {
  formState: GuildSettingsFormState;
  setLocale: (locale: string) => void;
  setTimezone: (timezone: string) => void;
  setLogChannel: (channel: string) => void;
  setAutoIsolate: (autoIsolate: boolean) => void;
  setDebugLogs: (debugLogs: boolean) => void;
  handleSave: (e?: React.FormEvent) => void;
  isSaving: boolean;
}

export type { GuildSettings };
