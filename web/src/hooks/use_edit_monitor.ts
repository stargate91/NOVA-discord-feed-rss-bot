import { useState, useEffect, useCallback } from 'react';
import { useConfig } from '@/hooks/use_config';
import { MonitorConfig } from '@/types/monitor';
import { GuildFeatures, DiscordChannel, DiscordRole } from '@/types/guild';
import guildService from '@/services/guild_service';
import {
  buildUpdateMonitorPayload,
  parseCryptoPairsFromString,
  CryptoPair,
} from '@/utils/monitor_form';

interface UseEditMonitorProps {
  monitor: MonitorConfig | null;
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updateData: Partial<MonitorConfig> & Record<string, any>) => Promise<boolean | void>;
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
  tier = 0,
  isPremium = false,
  features,
}: UseEditMonitorProps) {
  const { hasFeature } = useConfig();

  const isLocked = useCallback(
    (featureName: string) => {
      if (features) {
        if (featureName === 'custom_color') return !features.canCustomColor;
        if (featureName === 'alert_template') return !features.canAlertTemplate;
        if (featureName === 'custom_template') return !features.canCustomTemplate;
        if (featureName === 'genre_filter') return !features.canGenreFilter;
        if (featureName === 'tmdb_language_filter') return !features.canTmdbLanguageFilter;
        if (featureName === 'remove_branding') return !features.canRemoveBranding;
        return !features.features.includes(featureName);
      }
      return !hasFeature(tier, isPremium, featureName);
    },
    [features, hasFeature, tier, isPremium]
  );

  const [prevMonitorId, setPrevMonitorId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    target_channels: [] as string[],
    target_roles: [] as string[],
    embed_color: '',
    steam_patch_only: false,
    target_genres: [] as string[],
    target_languages: [] as string[],
    custom_alert: '',
    include_upcoming: false,
    use_native_player: false,
    custom_image: '',
    platform_input: '',
    send_initial_alert: false,
  });

  const [cryptoPairs, setCryptoPairs] = useState<CryptoPair[]>([{ symbol: '', threshold: '' }]);
  const [guildChannels, setGuildChannels] = useState<DiscordChannel[]>([]);
  const [guildRoles, setGuildRoles] = useState<DiscordRole[]>([]);
  const [loadingData, setLoadingData] = useState(false);
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
      setCryptoPairs(parseCryptoPairsFromString(symbolsStr));
    }
  }

  // Fetch Channels & Roles when modal opens
  useEffect(() => {
    if (!isOpen || !guildId) return;
    let ignore = false;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [channels, roles] = await Promise.all([
          guildService.getChannels(guildId),
          guildService.getRoles(guildId),
        ]);
        if (!ignore) {
          setGuildChannels(channels);
          setGuildRoles(roles);
        }
      } catch (err) {
        console.error('Failed to fetch guild context:', err);
      } finally {
        if (!ignore) {
          setLoadingData(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [isOpen, guildId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMultiChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCryptoPair = () => setCryptoPairs((prev) => [...prev, { symbol: '', threshold: '' }]);

  const removeCryptoPair = (index: number) =>
    setCryptoPairs((prev) => prev.filter((_, i) => i !== index));

  const updateCryptoPair = (index: number, field: 'symbol' | 'threshold', value: string) => {
    setCryptoPairs((prev) => {
      const next = [...prev];
      if (field === 'symbol') next[index][field] = value.toUpperCase();
      else next[index][field] = value;
      return next;
    });
  };

  const insertTemplateVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      custom_alert: (prev.custom_alert || '') + `{${variable}}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitor) return;
    setSaving(true);

    const updateData = buildUpdateMonitorPayload(formData as any, monitor.type, cryptoPairs);
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

