import React, { useState, useEffect } from 'react';
import { Hash, AtSign } from 'lucide-react';
import type { FeedMonitor, UpdateMonitorPayload } from '@/types';
import { useTranslation } from '@/i18n';
import { Modal, Button, Field, Input, Stack } from '@/ui';

export interface FeedEditModalProps {
  monitor: FeedMonitor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (monitorId: string, payload: UpdateMonitorPayload) => Promise<void>;
  isSaving?: boolean;
}

export const FeedEditModal: React.FC<FeedEditModalProps> = ({
  monitor,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [destChannel, setDestChannel] = useState<string>('');
  const [pingRole, setPingRole] = useState<string>('');

  useEffect(() => {
    if (monitor) {
      setDestChannel(monitor.destination_channel_id);
      setPingRole(monitor.ping_role_id || '');
    }
  }, [monitor]);

  if (!monitor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destChannel.trim()) return;

    await onSave(monitor.id, {
      destination_channel_id: destChannel.trim(),
      ping_role_id: pingRole.trim() || null,
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>
            {t('guild.editFeedTitle', { target: monitor.target_name || monitor.target_id })}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Stack gap="md">
            <Field label={t('guild.destChannelLabel')} required hint={t('guild.destChannelHint')}>
              <Input
                leftIcon={<Hash size={15} />}
                value={destChannel}
                onChange={(e) => setDestChannel(e.target.value)}
                placeholder={t('guild.destChannelPlaceholder')}
                clearable
              />
            </Field>

            <Field label={t('guild.pingRoleLabel')} optional hint={t('guild.pingRoleHint')}>
              <Input
                leftIcon={<AtSign size={15} />}
                value={pingRole}
                onChange={(e) => setPingRole(e.target.value)}
                placeholder={t('guild.pingRolePlaceholder')}
                clearable
              />
            </Field>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving || !destChannel.trim()}>
            {t('common.saveChanges')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
