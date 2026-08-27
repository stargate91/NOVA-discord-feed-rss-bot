import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import type { UseFeedFormReturn } from '../types';

export const useFeedForm = (defaultPlatform: string = 'youtube'): UseFeedFormReturn => {
  const { t } = useTranslation();
  const toast = useToast();

  const [platform, setPlatform] = useState<string>(defaultPlatform);
  const [targetId, setTargetId] = useState<string>('');
  const [destChannel, setDestChannel] = useState<string>('feed-alerts');
  const [pingRole, setPingRole] = useState<string>('');
  const [debouncedTargetId, setDebouncedTargetId] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTargetId(targetId);
    }, 200);
    return () => clearTimeout(timer);
  }, [targetId]);

  const resetForm = useCallback(() => {
    setTargetId('');
    setDestChannel('feed-alerts');
    setPingRole('');
  }, []);

  const validate = useCallback(() => {
    if (!targetId.trim()) {
      toast.warning(t('guild.toastValidationWarning'), t('guild.toastValidationWarningTitle'));
      return false;
    }
    return true;
  }, [targetId, toast, t]);

  const formState = useMemo(
    () => ({
      platform,
      targetId,
      destChannel,
      pingRole,
      debouncedTargetId,
    }),
    [platform, targetId, destChannel, pingRole, debouncedTargetId]
  );

  return {
    formState,
    setPlatform,
    setTargetId,
    setDestChannel,
    setPingRole,
    resetForm,
    validate,
  };
};
