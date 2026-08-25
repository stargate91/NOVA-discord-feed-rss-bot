import { useState, useCallback } from 'react';
import { MonitorConfig, UpdateMonitorPayload } from '@/types/monitor';
import { GuildFeatures } from '@/types/guild';
import { useGuildChannelsAndRoles } from '@/hooks/use_guild_channels_and_roles';
import { useMonitorFormState } from '@/hooks/use_monitor_form_state';
import { useGuildContext } from '@/context/guild_context';
import {
  buildUpdateMonitorPayload,
  CryptoPair,
  MonitorFormData,
} from '@/utils/monitor_form';

export type EditMonitorFormData = MonitorFormData & { steam_patch_only: boolean };

const INITIAL_EDIT_FORM_DATA: EditMonitorFormData = {
  name: '',
  target_channels: [],
  target_roles: [],
  embed_color: '',
  steam_patch_only: false,
  target_genres: [],
  target_languages: [],
  custom_alert: '',
  include_upcoming: false,
  use_native_player: false,
  custom_image: '',
  platform_input: '',
  send_initial_alert: false,
};

interface UseEditMonitorProps {
  monitor: MonitorConfig | null;
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updateData: UpdateMonitorPayload) => Promise<boolean | void>;
  tier?: number;
  isPremium?: boolean;
  features?: GuildFeatures;
}

export function useEditMonitor({
  monitor,
  guildId,
  isOpen,
  onClose,
  onSave,
}: UseEditMonitorProps) {
  const { isLocked, tierContext } = useGuildContext();

  const [prevMonitorId, setPrevMonitorId] = useState<number | null>(null);

  const {
    formData,
    setFormData,
    updateMultiField: handleMultiChange,
    insertTemplateVariable,
    loadCryptoFromString,
    cryptoPairs,
    setCryptoPairs,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
  } = useMonitorFormState<EditMonitorFormData>({
    initialData: INITIAL_EDIT_FORM_DATA,
    isLocked,
  });

  const { channelOptions: guildChannels, roleOptions: guildRoles, loading: loadingData } = useGuildChannelsAndRoles(guildId, isOpen);
  const [saving, setSaving] = useState(false);

  // Sync monitor state during render when monitor prop changes
  if (monitor && monitor.id !== prevMonitorId) {
    setPrevMonitorId(monitor.id);
    const extra: Record<string, any> =
      typeof monitor.extra_settings === 'object' && monitor.extra_settings !== null
        ? monitor.extra_settings
        : {};

    setFormData({
      name: monitor.name || '',
      target_channels: monitor.target_channels || [],
      target_roles: monitor.target_roles || [],
      embed_color: monitor.embed_color || '#3d3f45',
      steam_patch_only: !!monitor.steam_patch_only,
      target_genres: monitor.target_genres || [],
      target_languages: monitor.target_languages || [],
      custom_alert: monitor.custom_alert || extra.custom_alert || '',
      include_upcoming: !!(monitor.include_upcoming || extra.include_upcoming),
      use_native_player: !!(monitor.use_native_player || extra.use_native_player),
      custom_image: monitor.custom_image || extra.custom_image || '',
      platform_input: monitor.source_id || '',
      send_initial_alert: !!monitor.send_initial_alert,
    });

    if (monitor.type === 'crypto') {
      const rawSymbols = monitor.symbols || monitor.source_id || '';
      const symbolsStr = Array.isArray(rawSymbols) ? rawSymbols.join(',') : String(rawSymbols);
      loadCryptoFromString(symbolsStr);
    } else {
      loadCryptoFromString('');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitor) return;
    setSaving(true);

    const updateData = buildUpdateMonitorPayload(formData, monitor.type, cryptoPairs);
    if (monitor.type === 'steam_news') {
      updateData.steam_patch_only = formData.steam_patch_only;
    }

    try {
      const success = await onSave(monitor.id, updateData);
      if (success !== false) onClose();
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    cryptoPairs,
    guildChannels,
    guildRoles,
    loadingData,
    saving,
    isLocked,
    handleChange,
    handleMultiChange,
    insertTemplateVariable,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    handleSubmit,
  };
}


