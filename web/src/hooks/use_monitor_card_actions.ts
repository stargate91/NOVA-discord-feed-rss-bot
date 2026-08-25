import { useState, useCallback } from 'react';
import { useConfig } from '@/hooks/use_config';
import { MonitorConfig } from '@/types/monitor';
import monitorService from '@/services/monitor_service';

interface UseMonitorCardActionsProps {
  monitor: MonitorConfig;
  onToggle: (id: number, enabled: boolean) => Promise<void>;
  tier?: number;
  isPremium?: boolean;
}

export function useMonitorCardActions({
  monitor,
  onToggle,
  tier = 0,
  isPremium = false,
}: UseMonitorCardActionsProps) {
  const { getTierConfig, hasFeature } = useConfig();
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });
  const [repostCount, setRepostCount] = useState(1);
  const [purgeAmount, setPurgeAmount] = useState(50);

  const currentTier = getTierConfig(tier, isPremium);
  const canRepost = hasFeature(tier, isPremium, 'repost');
  const maxPurge = currentTier.max_purge || 10;
  const maxPurgeInputLimit = Math.min(100, maxPurge);

  const handleRepostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRepostCount(parseInt(e.target.value, 10));
  }, []);

  const handlePurgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPurgeAmount(parseInt(e.target.value, 10));
  }, []);

  const handleCardKeyDown = useCallback(
    (onSelect?: (id: number) => void, id?: number) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (onSelect && id !== undefined) {
          onSelect(id);
        }
      }
    },
    []
  );

  const handleToggle = useCallback(async () => {
    setToggleLoading(true);
    try {
      await onToggle(monitor.id, !monitor.enabled);
    } finally {
      setToggleLoading(false);
    }
  }, [monitor.id, monitor.enabled, onToggle]);

  const runAction = useCallback(
    async (action: 'check' | 'repost' | 'purge') => {
      setActionLoading(action);
      setActionStatus({ type: null, message: null });

      try {
        const actionType = action === 'repost' ? 'repost_latest' : action;
        const data = await monitorService.triggerAction(
          monitor.id,
          actionType as any,
          {
            count:
              action === 'repost'
                ? repostCount
                : action === 'purge'
                ? Math.min(purgeAmount, maxPurge)
                : 1,
          }
        );

        if (data.success !== false) {
          setActionStatus({
            type: 'success',
            message: data.message || 'Success!',
          });
        } else {
          setActionStatus({ type: 'error', message: data.error || 'Failed' });
        }
      } catch (err: any) {
        setActionStatus({
          type: 'error',
          message: err?.message || 'Connection error',
        });
      } finally {
        setActionLoading(null);
        setTimeout(() => setActionStatus({ type: null, message: null }), 6000);
      }
    },
    [monitor.id, repostCount, purgeAmount, maxPurge]
  );

  return {
    toggleLoading,
    showTools,
    setShowTools,
    actionLoading,
    actionStatus,
    repostCount,
    setRepostCount,
    handleRepostChange,
    purgeAmount,
    setPurgeAmount,
    handlePurgeChange,
    canRepost,
    maxPurge,
    maxPurgeInputLimit,
    handleToggle,
    handleCardKeyDown,
    runAction,
  };
}
