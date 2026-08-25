import { useState, useCallback } from 'react';
import { MonitorConfig } from '@/types/monitor';
import { GuildFeatures } from '@/types/guild';
import { useGuildContext } from '@/context/guild_context';
import { useMonitorMutations } from './use_monitor_mutations';

interface UseMonitorCardActionsProps {
  monitor: MonitorConfig;
  onToggle: (id: number, enabled: boolean) => Promise<void>;
  tier?: number;
  isPremium?: boolean;
  features?: GuildFeatures;
}

export function useMonitorCardActions({
  monitor,
  onToggle,
}: UseMonitorCardActionsProps) {
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });
  const [repostCount, setRepostCount] = useState(1);
  const [purgeAmount, setPurgeAmount] = useState(50);

  const mutations = useMonitorMutations();
  const { isLocked, maxPurge } = useGuildContext();
  const canRepost = !isLocked('repost');
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
      setActionStatus({ type: null, message: null });

      const actionType = action === 'repost' ? 'repost_latest' : action;
      const count =
        action === 'repost'
          ? repostCount
          : action === 'purge'
          ? Math.min(purgeAmount, maxPurge)
          : 1;

      const result = await mutations.triggerAction(monitor.id, actionType as any, { count });

      if (result.success) {
        setActionStatus({
          type: 'success',
          message: result.message || 'Success!',
        });
      } else {
        setActionStatus({ type: 'error', message: result.error || 'Failed' });
      }

      setTimeout(() => setActionStatus({ type: null, message: null }), 6000);
    },
    [monitor.id, repostCount, purgeAmount, maxPurge, mutations]
  );

  return {
    toggleLoading,
    showTools,
    setShowTools,
    actionLoading: mutations.actionLoading,
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

export default useMonitorCardActions;

