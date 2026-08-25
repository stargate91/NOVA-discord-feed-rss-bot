import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/context/toast_context';
import { useConfig } from '@/hooks/use_config';
import searchService from '@/services/search_service';
import guildService from '@/services/guild_service';
import monitorService from '@/services/monitor_service';
import { PlatformMetadata } from '@/types/monitor';
import { GuildFeatures, DiscordChannel, DiscordRole } from '@/types/guild';
import {
  buildCreateMonitorPayload,
  validateMonitorForm,
  INITIAL_MONITOR_FORM_DATA,
  CryptoPair,
  MonitorFormData,
} from '@/utils/monitor_form';

interface UseCreateMonitorWizardProps {
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tier?: number;
  isPremium?: boolean;
  features?: GuildFeatures;
}

export function useCreateMonitorWizard({
  guildId,
  isOpen,
  onClose,
  onSuccess,
  tier = 0,
  isPremium = false,
  features,
}: UseCreateMonitorWizardProps) {
  const { hasFeature } = useConfig();
  const { addToast } = useToast();

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

  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformMetadata | null>(null);
  const [formData, setFormData] = useState<MonitorFormData>(INITIAL_MONITOR_FORM_DATA);
  const [cryptoPairs, setCryptoPairs] = useState<CryptoPair[]>([{ symbol: '', threshold: '' }]);
  const [guildChannels, setGuildChannels] = useState<DiscordChannel[]>([]);
  const [guildRoles, setGuildRoles] = useState<DiscordRole[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);
  const [creating, setCreating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolvedChannel, setResolvedChannel] = useState<{ id: string; title: string; thumbnail?: string } | null>(null);

  // Universal Autocomplete States (Steam, Twitch, GitHub)
  const [autoQuery, setAutoQuery] = useState('');
  const [autoResults, setAutoResults] = useState<any[]>([]);
  const [isAutoSearching, setIsAutoSearching] = useState(false);
  const [showAutoDropdown, setShowAutoDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedPlatform(null);
    setFormData(INITIAL_MONITOR_FORM_DATA);
    setCryptoPairs([{ symbol: '', threshold: '' }]);
    setAutoQuery('');
    setAutoResults([]);
    setShowAutoDropdown(false);
    setResolvedChannel(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAutoDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Universal Search
  useEffect(() => {
    const supportedPlatforms = ['steam_news', 'twitch', 'github'];
    if (!selectedPlatform || !supportedPlatforms.includes(selectedPlatform.id)) return;

    const delayDebounceFn = setTimeout(async () => {
      if (autoQuery.trim().length >= 3) {
        setIsAutoSearching(true);
        try {
          const data = await searchService.searchPlatform(selectedPlatform.id, autoQuery);
          setAutoResults(data);
          setShowAutoDropdown(true);
        } catch (e) {
          console.error(`${selectedPlatform.id} search failed:`, e);
        }
        setIsAutoSearching(false);
      } else {
        setAutoResults([]);
        setShowAutoDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [autoQuery, selectedPlatform]);

  // Load Channels & Roles when modal opens
  useEffect(() => {
    if (!isOpen || !guildId) return;
    let ignore = false;

    async function loadData() {
      setLoadingContext(true);
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
        console.error('Failed to load guild channels/roles:', err);
      } finally {
        if (!ignore) {
          setLoadingContext(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [isOpen, guildId]);

  const handlePlatformSelect = (p: PlatformMetadata) => {
    setSelectedPlatform(p);
    setFormData({
      ...INITIAL_MONITOR_FORM_DATA,
      embed_color: p.color || '#3d3f45',
      name: p.isGlobal ? p.name : '',
    });
    setStep(2);
  };

  const handleYouTubeResolve = async () => {
    if (!formData.platform_input) return;
    setResolving(true);
    try {
      const data = await searchService.resolveYouTube(formData.platform_input);
      setResolvedChannel(data);
      setFormData((prev) => ({ ...prev, platform_input: data.id, name: data.title }));
      addToast(`Found: ${data.title}`, 'success', 'YouTube Found');
    } catch (err: any) {
      console.error(err);
      addToast('Could not find YouTube channel. Check the name/link.', 'error', 'Not Found');
    } finally {
      setResolving(false);
    }
  };

  const addCryptoPair = () => {
    setCryptoPairs((prev) => [...prev, { symbol: '', threshold: '' }]);
  };

  const removeCryptoPair = (index: number) => {
    setCryptoPairs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateCryptoPair = (index: number, field: keyof CryptoPair, value: string) => {
    setCryptoPairs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleInputChange = useCallback((field: keyof MonitorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleMultiChange = useCallback((field: keyof MonitorFormData, value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleChange = useCallback((field: keyof MonitorFormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  }, []);

  const handleColorChange = useCallback((color: string) => {
    if (!isLocked('custom_color')) {
      setFormData((prev) => ({ ...prev, embed_color: color }));
    }
  }, [isLocked]);

  const selectAutocompleteItem = useCallback((item: { id: string; name: string }) => {
    setFormData((prev) => ({ ...prev, platform_input: item.id, name: item.name }));
    setAutoQuery(item.id);
    setShowAutoDropdown(false);
  }, []);

  const insertTemplateVariable = useCallback((varName: string) => {
    if (!isLocked('alert_template')) {
      setFormData((prev) => ({
        ...prev,
        custom_alert: (prev.custom_alert || '') + `{${varName}}`,
      }));
    }
  }, [isLocked]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlatform) return;

    const validationError = validateMonitorForm(formData, selectedPlatform, cryptoPairs);
    if (validationError) {
      addToast(validationError, 'error', 'Validation Error');
      return;
    }

    const payload = buildCreateMonitorPayload(formData, selectedPlatform, guildId, cryptoPairs);
    setCreating(true);

    try {
      await monitorService.createMonitor(payload as any);
      addToast(`Created ${formData.name || selectedPlatform.name} monitor!`, 'success', 'Success');
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || 'Failed to create monitor', 'error', 'Creation Failed');
    } finally {
      setCreating(false);
    }
  };

  return {
    step,
    setStep,
    selectedPlatform,
    setSelectedPlatform,
    formData,
    setFormData,
    cryptoPairs,
    setCryptoPairs,
    guildChannels,
    guildRoles,
    loadingContext,
    creating,
    resolving,
    resolvedChannel,
    setResolvedChannel,
    autoQuery,
    setAutoQuery,
    autoResults,
    setAutoResults,
    isAutoSearching,
    showAutoDropdown,
    setShowAutoDropdown,
    dropdownRef,
    isLocked,
    handleClose,
    handlePlatformSelect,
    handleYouTubeResolve,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    handleInputChange,
    handleMultiChange,
    handleToggleChange,
    handleColorChange,
    selectAutocompleteItem,
    insertTemplateVariable,
    handleSubmit,
    resetState,
  };
}
