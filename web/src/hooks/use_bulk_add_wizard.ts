import { useState, useCallback } from 'react';
import { BulkPlatformMetadata } from '@/types/monitor';
import { useToast } from '@/context/toast_context';
import { useGuildContext } from '@/context/guild_context';
import { useGuildChannelsAndRoles } from '@/hooks/use_guild_channels_and_roles';
import { useMonitorMutations } from '@/hooks/use_monitor_mutations';
import { useMonitorFormState } from '@/hooks/use_monitor_form_state';
import {
  BulkAddFormData,
  INITIAL_BULK_ADD_DATA,
  parseSourcesList,
  validateBulkAddInputs,
  buildBulkAddPayload,
} from '@/utils/monitor_form';

export interface BulkAddResult {
  successCount: number;
  errorCount: number;
  errors?: string[];
}

export interface UseBulkAddWizardOptions {
  guildId: string;
  isOpen: boolean;
  onSuccess?: () => void;
}

export function useBulkAddWizard(
  guildIdOrOptions: string | UseBulkAddWizardOptions,
  isOpenProp: boolean = false,
  onSuccessProp?: () => void
) {
  const options: UseBulkAddWizardOptions =
    typeof guildIdOrOptions === 'string'
      ? { guildId: guildIdOrOptions, isOpen: isOpenProp, onSuccess: onSuccessProp }
      : guildIdOrOptions;

  const { guildId, isOpen, onSuccess } = options;

  const mutations = useMonitorMutations();
  const { isMaster, isLocked } = useGuildContext();
  const isTierEligible = !isLocked('bulk_import');
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<BulkPlatformMetadata | null>(null);
  const [results, setResults] = useState<BulkAddResult | null>(null);

  const {
    formData,
    setFormData,
    updateField,
    updateFields,
    toggleField,
    handleColorChange,
    resetForm,
  } = useMonitorFormState<BulkAddFormData>({
    initialData: INITIAL_BULK_ADD_DATA,
    isLocked,
  });

  const { channels, roles, channelOptions, roleOptions } = useGuildChannelsAndRoles(guildId, isOpen);

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedPlatform(null);
    setResults(null);
    resetForm(INITIAL_BULK_ADD_DATA);
  }, [resetForm]);

  const handleNext = useCallback(() => {
    if (step === 1 && !selectedPlatform) return;
    setStep((prev) => prev + 1);
  }, [step, selectedPlatform]);

  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  const handlePlatformSelect = useCallback((platform: BulkPlatformMetadata) => {
    setSelectedPlatform(platform);
    updateField('embed_color', platform.color || '#3d3f45');
  }, [updateField]);

  const handleSubmit = useCallback(async () => {
    if (!selectedPlatform) return;

    const items = parseSourcesList(formData.sources_input);
    const validation = validateBulkAddInputs(items, formData.target_channels);
    if (!validation.isValid) {
      addToast(validation.errorMessage!, 'error', validation.errorTitle);
      return;
    }

    const payload = buildBulkAddPayload({
      guildId,
      platformId: selectedPlatform.id,
      sources: items,
      targetChannels: formData.target_channels,
      targetRoles: formData.target_roles,
      embedColor: formData.embed_color,
      sendInitialAlert: formData.send_initial_alert,
      useNativePlayer: formData.use_native_player,
      customImage: formData.custom_image,
    });

    const data = await mutations.bulkAddMonitors(payload);
    if (data) {
      setResults(data);
      setStep(3);
      if (onSuccess) onSuccess();
    }
  }, [selectedPlatform, formData, guildId, mutations, onSuccess, addToast]);

  return {
    step,
    setStep,
    selectedPlatform,
    setSelectedPlatform,
    formData,
    setFormData,
    updateField,
    updateFields,
    toggleField,
    handleColorChange,
    handlePlatformSelect,
    channels,
    roles,
    channelOptions,
    roleOptions,
    processing: mutations.bulkProcessing,
    results,
    isMaster,
    isTierEligible,
    isLocked,
    handleNext,
    handleBack,
    handleSubmit,
    resetState,
  };
}

export default useBulkAddWizard;
