import { useState } from 'react';
import { useToast } from '@/context/toast_context';
import { useGuildContext } from '@/context/guild_context';
import { GuildFeatures } from '@/types/guild';
import { TOAST_MESSAGES } from '@/constants/toasts';
import { useGuildChannelsAndRoles } from '@/hooks/use_guild_channels_and_roles';


export interface BulkEditFormData {
  target_channels: string[];
  target_roles: string[];
  embed_color: string;
  use_channels: boolean;
  use_roles: boolean;
  use_color: boolean;
  use_native: boolean;
  use_native_player: boolean;
  use_custom_image: boolean;
  custom_image: string;
}

export function useBulkEdit(
  guildId: string,
  isOpen: boolean,
  onSave?: (updateData: Record<string, any>) => Promise<void | boolean>,
  onClose?: () => void,
) {
  const toast = useToast();
  const { isLocked: checkIsLocked, tierContext } = useGuildContext();

  const [loading, setLoading] = useState(false);
  const {
    channelOptions: guildChannels,
    roleOptions: guildRoles,
    loading: loadingContext,
  } = useGuildChannelsAndRoles(guildId, isOpen);


  const [formData, setFormData] = useState<BulkEditFormData>({
    target_channels: [],
    target_roles: [],
    embed_color: '#3d3f45',
    use_channels: false,
    use_roles: false,
    use_color: false,
    use_native: false,
    use_native_player: false,
    use_custom_image: false,
    custom_image: '',
  });

  const isLocked = checkIsLocked('bulk_import');
  const isImageLocked = checkIsLocked('remove_branding');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      toast.error(
        TOAST_MESSAGES.MONITOR.BULK_LOCKED,
        undefined,
        'Locked'
      );
      return;
    }

    const updateData: Record<string, any> = {};
    if (formData.use_channels) updateData.target_channels = formData.target_channels;
    if (formData.use_roles) updateData.target_roles = formData.target_roles;
    if (formData.use_color) updateData.embed_color = formData.embed_color;
    if (formData.use_native) updateData.use_native_player = formData.use_native_player;
    if (formData.use_custom_image) updateData.custom_image = formData.custom_image;

    if (Object.keys(updateData).length === 0) {
      toast.info(TOAST_MESSAGES.MONITOR.NO_CHANGES, 'No changes');
      return;
    }


    if (onSave) {
      setLoading(true);
      try {
        await onSave(updateData);
        if (onClose) onClose();
      } catch (err: any) {
        toast.error(err, TOAST_MESSAGES.MONITOR.BULK_UPDATE_ERROR);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleField = (
    field: 'use_channels' | 'use_roles' | 'use_color' | 'use_native' | 'use_custom_image',
    enabled?: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: enabled !== undefined ? enabled : !prev[field],
    }));
  };

  const updateField = <K extends keyof BulkEditFormData>(
    field: K,
    value: BulkEditFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
    handleSubmit,
  };
}
