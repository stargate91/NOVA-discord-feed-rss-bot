import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/context/toast_context';
import { useGuildContext } from '@/context/guild_context';
import { useDropdown } from '@/hooks/use_dropdown';
import { useGuildChannelsAndRoles } from '@/hooks/use_guild_channels_and_roles';
import { usePlatformSearch } from '@/hooks/use_platform_search';
import { useMonitorFormState } from '@/hooks/use_monitor_form_state';
import { useMonitorMutations } from './use_monitor_mutations';
import { PlatformMetadata } from '@/types/monitor';
import { GuildFeatures } from '@/types/guild';
import { TOAST_MESSAGES } from '@/constants/toasts';
import {
  buildCreateMonitorPayload,
  INITIAL_MONITOR_FORM_DATA,
  MonitorFormData,
} from '@/utils/monitor_form';

interface UseCreateMonitorWizardProps {
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


export function useCreateMonitorWizard({
  guildId,
  isOpen,
  onClose,
  onSuccess,
}: UseCreateMonitorWizardProps) {
  const toast = useToast();
  const mutations = useMonitorMutations();
  const { isLocked, tierContext } = useGuildContext();

  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformMetadata | null>(null);
  const {
    formData,
    setFormData,
    updateField: handleInputChange,
    updateMultiField: handleMultiChange,
    toggleField: handleToggleChange,
    handleColorChange,
    insertTemplateVariable,
    validate,
    resetForm,
    cryptoPairs,
    setCryptoPairs,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    resetCryptoPairs,
  } = useMonitorFormState({ isLocked });

  const { channelOptions: guildChannels, roleOptions: guildRoles, loading: loadingContext } = useGuildChannelsAndRoles(guildId, isOpen);
  const [resolving, setResolving] = useState(false);
  const [resolvedChannel, setResolvedChannel] = useState<{ id: string; title: string; thumbnail?: string } | null>(null);

  // Universal Autocomplete & Search Hook
  const {
    query: autoQuery,
    setQuery: setAutoQuery,
    results: autoResults,
    isSearching: isAutoSearching,
    resolveYouTube,
    clear: clearSearch,
  } = usePlatformSearch(selectedPlatform?.id);

  const {
    isOpen: isAutoDropdownOpen,
    setIsOpen: setIsAutoDropdownOpen,
    closeDropdown: closeAutoDropdown,
    dropdownRef,
  } = useDropdown({ initialOpen: false });

  useEffect(() => {
    if (autoResults.length > 0) {
      setIsAutoDropdownOpen(true);
    } else {
      setIsAutoDropdownOpen(false);
    }
  }, [autoResults, setIsAutoDropdownOpen]);

  const showAutoDropdown = autoResults.length > 0 && isAutoDropdownOpen;

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedPlatform(null);
    resetForm();
    clearSearch();
    closeAutoDropdown();
    setResolvedChannel(null);
  }, [clearSearch, resetForm, closeAutoDropdown]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

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
      const data = await resolveYouTube(formData.platform_input);
      if (data) {
        setResolvedChannel(data);
        setFormData((prev) => ({ ...prev, platform_input: data.id, name: data.title }));
        toast.success(TOAST_MESSAGES.MONITOR.YOUTUBE_RESOLVED(data.title), 'YouTube Found');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err, TOAST_MESSAGES.MONITOR.YOUTUBE_NOT_FOUND, 'Not Found');
    } finally {
      setResolving(false);
    }
  };

  const selectAutocompleteItem = useCallback((item: { id: string; name: string }) => {
    setFormData((prev) => ({ ...prev, platform_input: item.id, name: item.name }));
    setAutoQuery(item.id);
    closeAutoDropdown();
  }, [setAutoQuery, setFormData, closeAutoDropdown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlatform) return;

    const validationError = validate(selectedPlatform);
    if (validationError) {
      toast.error(validationError, TOAST_MESSAGES.MONITOR.VALIDATION_ERROR, 'Validation Error');
      return;
    }

    const payload = buildCreateMonitorPayload(formData, selectedPlatform, guildId, cryptoPairs);
    const created = await mutations.createMonitor(payload, formData.name || selectedPlatform.name);
    if (created) {
      onSuccess();
      handleClose();
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
    creating: mutations.creating,
    resolving,
    resolvedChannel,
    setResolvedChannel,
    autoQuery,
    setAutoQuery,
    autoResults,
    isAutoSearching,
    showAutoDropdown,
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
