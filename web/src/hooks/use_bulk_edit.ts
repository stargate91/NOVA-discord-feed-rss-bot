import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import guildService from '@/services/guild_service';
import { useToast } from '@/context/toast_context';
import { GuildFeatures } from '@/types/guild';

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
  tier: number = 0,
  isPremium: boolean = false,
  onSave?: (updateData: Record<string, any>) => Promise<void | boolean>,
  onClose?: () => void,
  features?: GuildFeatures
) {
  const { addToast } = useToast();
  const { data: session } = useSession();
  const isMasterUser = (session?.user as any)?.role === 'master';

  const [loading, setLoading] = useState(false);
  const [guildChannels, setGuildChannels] = useState<any[]>([]);
  const [guildRoles, setGuildRoles] = useState<any[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);

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

  const isLocked = features
    ? !features.canBulkImport
    : (!isMasterUser && !isPremium && tier < 2);

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
        console.error('Failed to load channels/roles:', err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      addToast(
        'Bulk editing requires Professional Tier (Tier 2) or higher.',
        'error',
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
      addToast('Please select at least one field to update.', 'info', 'No changes');
      return;
    }

    if (onSave) {
      setLoading(true);
      try {
        await onSave(updateData);
        if (onClose) onClose();
      } catch (err: any) {
        addToast(err?.message || 'Failed to update monitors', 'error');
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
    toggleField,
    updateField,
    handleSubmit,
  };
}
