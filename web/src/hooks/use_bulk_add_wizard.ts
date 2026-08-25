import { useState } from 'react';
import { BulkPlatformMetadata } from '@/types/monitor';
import { useToast } from '@/context/toast_context';
import { useGuildContext } from '@/context/guild_context';
import { useGuildChannelsAndRoles } from '@/hooks/use_guild_channels_and_roles';
import { useMonitorMutations } from '@/hooks/use_monitor_mutations';
import {
  parseSourcesList,
  validateBulkAddInputs,
  buildBulkAddPayload,
} from '@/utils/bulk_import';

import { GuildFeatures } from '@/types/guild';

export interface BulkAddResult {
  successCount: number;
  errorCount: number;
  errors?: string[];
}

export interface UseBulkAddWizardOptions {
  guildId: string;
  isOpen: boolean;
  onSuccess?: () => void;
  tier?: number;
  isPremium?: boolean;
  features?: GuildFeatures;
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

  const {
    guildId,
    isOpen,
    onSuccess,
  } = options;

  const mutations = useMonitorMutations();
  const { isMaster, isLocked, tierContext } = useGuildContext();
  const isTierEligible = !isLocked('bulk_import');
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<BulkPlatformMetadata | null>(null);
  const [inputList, setInputList] = useState('');
  const [targetChannels, setTargetChannels] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [embedColor, setEmbedColor] = useState('#3d3f45');
  const { channels, roles, channelOptions, roleOptions } = useGuildChannelsAndRoles(guildId, isOpen);

  const [results, setResults] = useState<BulkAddResult | null>(null);
  const [sendInitialAlert, setSendInitialAlert] = useState(false);
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  const [customImage, setCustomImage] = useState('');

  const resetState = () => {
    setStep(1);
    setSelectedPlatform(null);
    setInputList('');
    setTargetChannels([]);
    setTargetRoles([]);
    setResults(null);
    setCustomImage('');
    setSendInitialAlert(false);
    setUseNativePlayer(false);
  };

  const handleNext = () => {
    if (step === 1 && !selectedPlatform) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!selectedPlatform) return;

    const items = parseSourcesList(inputList);
    const validation = validateBulkAddInputs(items, targetChannels);
    if (!validation.isValid) {
      addToast(validation.errorMessage!, 'error', validation.errorTitle);
      return;
    }

    const payload = buildBulkAddPayload({
      guildId,
      platformId: selectedPlatform.id,
      sources: items,
      targetChannels,
      targetRoles,
      embedColor,
      sendInitialAlert,
      useNativePlayer,
      customImage,
    });

    const data = await mutations.bulkAddMonitors(payload);
    if (data) {
      setResults(data);
      setStep(3);
      if (onSuccess) onSuccess();
    }
  };

  return {
    step,
    setStep,
    selectedPlatform,
    setSelectedPlatform,
    inputList,
    setInputList,
    targetChannels,
    setTargetChannels,
    targetRoles,
    setTargetRoles,
    embedColor,
    setEmbedColor,
    channels,
    roles,
    channelOptions,
    roleOptions,
    processing: mutations.bulkProcessing,

    results,
    sendInitialAlert,
    setSendInitialAlert,
    useNativePlayer,
    setUseNativePlayer,
    customImage,
    setCustomImage,
    isMaster,
    isTierEligible,
    handleNext,
    handleBack,
    handleSubmit,
    resetState,
  };
}

