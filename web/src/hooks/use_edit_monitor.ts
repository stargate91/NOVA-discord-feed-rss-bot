import { useState, useCallback, useEffect } from 'react';
import { MonitorConfig, UpdateMonitorPayload } from '@/types/monitor';
import { GuildFeatures } from '@/types/guild';
import { useGuildChannelsAndRoles } from '@/hooks/use_guild_channels_and_roles';
import { useMonitorFormState } from '@/hooks/use_monitor_form_state';
import { useGuildContext } from '@/context/guild_context';
import {
  buildUpdateMonitorPayload,
  extractCryptoPairsFromMonitor,
  extractMonitorFormData,
  CryptoPair,
  MonitorFormData,
  INITIAL_MONITOR_FORM_DATA,
} from '@/utils/monitor_form';

export interface UseEditMonitorProps {
  monitor: MonitorConfig | null;
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updateData: UpdateMonitorPayload) => Promise<boolean | void>;
}


export function useEditMonitor({
  monitor,
  guildId,
  isOpen,
  onClose,
  onSave,
}: UseEditMonitorProps) {
  const { isLocked } = useGuildContext();

  const {
    formData,
    setFormData,
    handleChange,
    updateMultiField: handleMultiChange,
    insertTemplateVariable,
    cryptoPairs,
    setCryptoPairs,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    resetCryptoPairs,
  } = useMonitorFormState({
    initialData: INITIAL_MONITOR_FORM_DATA,
    isLocked,
  });

  const { channelOptions: guildChannels, roleOptions: guildRoles, loading: loadingData } = useGuildChannelsAndRoles(guildId, isOpen);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !monitor) return;

    setFormData(extractMonitorFormData(monitor));

    if (monitor.type === 'crypto') {
      setCryptoPairs(extractCryptoPairsFromMonitor(monitor));
    } else {
      resetCryptoPairs();
    }
  }, [monitor, isOpen, setFormData, setCryptoPairs, resetCryptoPairs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitor) return;
    setSaving(true);

    const updateData = buildUpdateMonitorPayload(formData, monitor.type, cryptoPairs);

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


