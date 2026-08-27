import React from 'react';
import { Trash2, Zap } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/Toast';
import { Stack, Inline, Text, Button } from '@/ui';

interface FeedPageHeaderProps {
  guildId: string;
  onClearForm: () => void;
  onRunTest: () => void;
}

export const FeedPageHeader: React.FC<FeedPageHeaderProps> = ({
  guildId,
  onClearForm,
  onRunTest,
}) => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const toast = useToast();

  const handleClear = async () => {
    const isConfirmed = await confirm({
      title: t('guild.toastFormClearedTitle'),
      message: t('guild.confirmClearForm'),
      variant: 'warning',
      confirmText: t('common.save'),
      cancelText: t('common.cancel'),
    });

    if (isConfirmed) {
      onClearForm();
      toast.info(t('guild.toastFormCleared'), t('guild.toastFormClearedTitle'));
    }
  };

  return (
    <Inline justify="between" align="center" wrap gap="md">
      <Stack gap="3xs">
        <Text as="h2" size="lg" weight="bold">
          {t('guild.feedsTitle')}
        </Text>
        <Text size="xs" color="secondary">
          {t('guild.feedsSubtitle', { guildId })}
        </Text>
      </Stack>

      <Inline gap="xs" wrap>
        <Button variant="secondary" onClick={handleClear}>
          <Trash2 size={14} /> {t('guild.clearFormBtn')}
        </Button>
        <Button variant="primary" onClick={onRunTest}>
          <Zap size={14} /> {t('guild.runTestBtn')}
        </Button>
      </Inline>
    </Inline>
  );
};
