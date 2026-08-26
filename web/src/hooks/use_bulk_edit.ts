import { useState, useCallback } from 'react';
import { useToast } from '@/context/toast_context';
import { useGuildContext } from '@/context/guild_context';
import { TOAST_MESSAGES } from '@/constants/toasts';
import { useGuildChannelsAndRoles } from '@/hooks/use_guild_channels_and_roles';
import { useMonitorFormState } from '@/hooks/use_monitor_form_state';
import {
  BulkEditFormData,
  INITIAL_BULK_EDIT_DATA,
  buildBulkEditPayload,
  hasBulkEditChanges,
} from '@/utils/monitor_form';

export type { BulkEditFormData };

export function useBulkEdit(
  guildId: string,
  isOpen: boolean,
  onSave?: (updateData: Record<string, any>) => Promise<void | boolean>,
  onClose?: () => void,
) {
  const toast = useToast();
  const { isLocked: checkIsLocked } = useGuildContext();

  const [loading, setLoading] = useState(false);
  const {
    channelOptions: guildChannels,
    roleOptions: guildRoles,
    loading: loadingContext,
  } = useGuildChannelsAndRoles(guildId, isOpen);

  const {
    formData,
    setFormData,
    updateField,
    toggleField,
    resetForm,
  } = useMonitorFormState<BulkEditFormData>({
    initialData: INITIAL_BULK_EDIT_DATA,
  });

  const isLocked = checkIsLocked('bulk_import');
  const isImageLocked = checkIsLocked('remove_branding');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      toast.error(
        TOAST_MESSAGES.MONITOR.BULK_LOCKED,
        undefined,
        'Locked'
      );
      return;
    }

    const updateData = buildBulkEditPayload(formData);

    if (!hasBulkEditChanges(updateData)) {
      toast.info(TOAST_MESSAGES.MONITOR.NO_CHANGES, 'No changes');
      return;
    }

    if (onSave) {
      setLoading(true);
      try {
        const res = await onSave(updateData);
        if (res !== false) {
          if (onClose) onClose();
        }
      } catch (err: unknown) {
        toast.error(err, TOAST_MESSAGES.MONITOR.BULK_UPDATE_ERROR);
      } finally {
        setLoading(false);
      }
    }
  }, [formData, isLocked, onSave, onClose, toast]);

  return {
    formData,
    setFormData,
    loading,
    loadingContext,
    guildChannels,
    guildRoles,
    isLocked,
    isImageLocked,
    toggleField,
    updateField,
    resetForm,
    handleSubmit,
  };
}
