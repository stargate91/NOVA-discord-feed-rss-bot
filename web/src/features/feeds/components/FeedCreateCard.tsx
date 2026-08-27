import React from 'react';
import { Rss, Hash, AtSign } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import { Card, Button, Input, Select, Field, Stack } from '@/ui';
import { FEED_TYPE_OPTIONS } from '../constants';
import type { UseFeedFormReturn } from '../types';
import type { CreateMonitorPayload } from '@/types';

interface FeedCreateCardProps {
  guildId: string;
  form: UseFeedFormReturn;
  isSubmitting?: boolean;
  onSubmitFeed?: (payload: CreateMonitorPayload) => Promise<unknown>;
}

export const FeedCreateCard: React.FC<FeedCreateCardProps> = ({
  form,
  isSubmitting = false,
  onSubmitFeed,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { formState, setPlatform, setTargetId, setDestChannel, setPingRole, validate } = form;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      if (onSubmitFeed) {
        await onSubmitFeed({
          platform: formState.platform as CreateMonitorPayload['platform'],
          target_id: formState.targetId,
          destination_channel_id: formState.destChannel,
          ping_role_id: formState.pingRole || null,
        });
      }
      toast.success(
        t('guild.toastMonitorSaved', {
          targetId: formState.targetId,
          type: formState.platform,
        }),
        t('guild.toastMonitorSavedTitle')
      );
    } catch {
      toast.error('Failed to save feed monitor');
    }
  };

  return (
    <Card
      glow="blue"
      padding="xl"
      title={t('guild.addMonitorTitle')}
      subtitle={t('guild.selectedTypeSubtitle', {
        type: formState.platform.toUpperCase(),
      })}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Field label={t('guild.typeLabel')} required>
            <Select
              leftIcon={<Rss size={15} />}
              value={formState.platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={FEED_TYPE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(opt.labelKey),
                description: t(opt.descKey),
              }))}
            />
          </Field>

          <Field label={t('guild.targetIdLabel')} required hint={t('guild.targetIdHint')}>
            <Input
              value={formState.targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder={t('guild.targetIdPlaceholder')}
              clearable
            />
          </Field>

          <Field label={t('guild.destChannelLabel')} required hint={t('guild.destChannelHint')}>
            <Input
              leftIcon={<Hash size={15} />}
              value={formState.destChannel}
              onChange={(e) => setDestChannel(e.target.value)}
              placeholder={t('guild.destChannelPlaceholder')}
              clearable
            />
          </Field>

          <Field label={t('guild.pingRoleLabel')} optional hint={t('guild.pingRoleHint')}>
            <Input
              leftIcon={<AtSign size={15} />}
              value={formState.pingRole}
              onChange={(e) => setPingRole(e.target.value)}
              placeholder={t('guild.pingRolePlaceholder')}
              clearable
            />
          </Field>

          <Button type="submit" variant="primary" fullWidth size="lg" disabled={isSubmitting}>
            {t('guild.saveMonitorBtn')}
          </Button>
        </Stack>
      </form>
    </Card>
  );
};
