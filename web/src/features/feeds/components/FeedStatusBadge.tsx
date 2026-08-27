import React from 'react';
import type { FeedMonitorStatus } from '@/types';
import { useTranslation } from '@/i18n';
import { Badge } from '@/ui';

export interface FeedStatusBadgeProps {
  status: FeedMonitorStatus;
}

export const FeedStatusBadge: React.FC<FeedStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  switch (status) {
    case 'active':
      return (
        <Badge variant="online" dot>
          {t('guild.statusActive')}
        </Badge>
      );
    case 'paused':
      return (
        <Badge variant="neutral" dot>
          {t('guild.statusPaused')}
        </Badge>
      );
    case 'rate_limited':
      return (
        <Badge variant="warning" dot>
          {t('guild.statusRateLimited')}
        </Badge>
      );
    case 'dead_channel':
      return (
        <Badge variant="danger" dot>
          {t('guild.statusDeadChannel')}
        </Badge>
      );
    case 'error':
    default:
      return (
        <Badge variant="danger" dot>
          {t('guild.statusError')}
        </Badge>
      );
  }
};
