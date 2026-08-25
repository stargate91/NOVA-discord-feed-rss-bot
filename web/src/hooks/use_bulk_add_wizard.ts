import { useState, useEffect } from 'react';
import guildService from '@/services/guild_service';
import monitorService from '@/services/monitor_service';
import { BulkPlatformMetadata } from '@/types/monitor';
import { useToast } from '@/context/toast_context';
import {
  parseSourcesList,
  validateBulkAddInputs,
  buildBulkAddPayload,
} from '@/utils/bulk_import';

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
    tier = 0,
    isPremium = false,
  } = options;

  const isMaster = isPremium && tier === 0;
  const isTierEligible = isMaster || (isPremium && tier >= 2);
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<BulkPlatformMetadata | null>(null);
  const [inputList, setInputList] = useState('');
  const [targetChannels, setTargetChannels] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [embedColor, setEmbedColor] = useState('#3d3f45');
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
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

  useEffect(() => {
    if (!isOpen || !guildId) return;
    let ignore = false;

    async function loadGuildData() {
      try {
        const [chanData, roleData] = await Promise.all([
          guildService.getChannels(guildId),
          guildService.getRoles(guildId),
        ]);
        if (!ignore) {
          setChannels(chanData);
          setRoles(roleData);
        }
      } catch (err) {
        console.error('Failed to fetch guild data:', err);
      }
    }

    loadGuildData();

    return () => {
      ignore = true;
    };
  }, [isOpen, guildId]);

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

    setProcessing(true);
    try {
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

      const data = await monitorService.bulkAddMonitors(payload);

      setResults(data);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Bulk add error:', err);
      addToast(
        err?.message || 'Failed to process bulk add.',
        'error',
        'Processing Failed'
      );
    } finally {
      setProcessing(false);
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
    processing,
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

