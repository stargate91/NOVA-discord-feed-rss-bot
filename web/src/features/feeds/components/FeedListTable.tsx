import React, { useState } from 'react';
import { Settings2, Trash2, Search, Radio, Hash } from 'lucide-react';
import type { FeedMonitor, UpdateMonitorPayload } from '@/types';
import { useTranslation } from '@/i18n';
import { formatRelativeTime } from '@/utils';
import {
  Card,
  Table,
  Button,
  Input,
  Inline,
  Stack,
  Text,
  Badge,
  Skeleton,
} from '@/ui';
import { FeedStatusBadge } from './FeedStatusBadge';
import { FeedEditModal } from './FeedEditModal';
import styles from './FeedListTable.module.css';

export interface FeedListTableProps {
  feeds: FeedMonitor[];
  isLoading?: boolean;
  onUpdateFeed?: (monitorId: string, payload: UpdateMonitorPayload) => Promise<void>;
  onDeleteFeed?: (monitorId: string) => Promise<void>;
}

export const FeedListTable: React.FC<FeedListTableProps> = ({
  feeds,
  isLoading = false,
  onUpdateFeed,
  onDeleteFeed,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingMonitor, setEditingMonitor] = useState<FeedMonitor | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const filteredFeeds = feeds.filter((feed) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      feed.target_id.toLowerCase().includes(query) ||
      (feed.target_name && feed.target_name.toLowerCase().includes(query)) ||
      feed.platform.toLowerCase().includes(query) ||
      feed.destination_channel_id.toLowerCase().includes(query)
    );
  });

  const handleSaveEdit = async (monitorId: string, payload: UpdateMonitorPayload) => {
    if (!onUpdateFeed) return;
    setIsUpdating(true);
    try {
      await onUpdateFeed(monitorId, payload);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card
        padding="lg"
        title={t('guild.activeMonitorsTitle')}
        subtitle={t('guild.activeMonitorsSubtitle', { count: feeds.length })}
        action={
          <div className={styles.searchWrapper}>
            <Input
              size="sm"
              leftIcon={<Search size={14} />}
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              clearable
            />
          </div>
        }
      >
        {isLoading ? (
          <Stack gap="sm">
            <Skeleton height="md" />
            <Skeleton height="md" />
            <Skeleton height="md" />
          </Stack>
        ) : filteredFeeds.length === 0 ? (
          <Stack align="center" gap="sm" className={styles.emptyState}>
            <Radio size={28} color="var(--slate-500)" />
            <Text weight="semibold">{t('guild.emptyMonitorsTitle')}</Text>
            <Text size="xs" color="secondary">
              {searchQuery ? t('guild.noMatchingMonitors') : t('guild.emptyMonitorsDesc')}
            </Text>
          </Stack>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>{t('guild.colPlatform')}</Table.Head>
                <Table.Head>{t('guild.colTarget')}</Table.Head>
                <Table.Head>{t('guild.colDestination')}</Table.Head>
                <Table.Head>{t('guild.colStatus')}</Table.Head>
                <Table.Head>{t('guild.colLastActivity')}</Table.Head>
                <Table.Head align="right">{t('guild.colActions')}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredFeeds.map((feed) => (
                <Table.Row key={feed.id}>
                  <Table.Cell>
                    <Inline align="center" gap="xs">
                      <img
                        src={`/images/brands/${feed.platform}.png`}
                        alt={feed.platform}
                        className={styles.brandIcon}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <Text size="xs" weight="semibold">
                        {feed.platform.toUpperCase()}
                      </Text>
                    </Inline>
                  </Table.Cell>

                  <Table.Cell>
                    <Stack gap="3xs">
                      <Text size="xs" weight="semibold">
                        {feed.target_name || feed.target_id}
                      </Text>
                      {feed.target_name && feed.target_name !== feed.target_id && (
                        <Text size="2xs" color="muted" mono>
                          {feed.target_id}
                        </Text>
                      )}
                    </Stack>
                  </Table.Cell>

                  <Table.Cell>
                    <Inline align="center" gap="3xs">
                      <Hash size={13} color="var(--slate-400)" />
                      <Text size="xs" mono>
                        {feed.destination_channel_name || feed.destination_channel_id}
                      </Text>
                      {feed.ping_role_id && (
                        <Badge variant="neutral" size="sm">
                          @{feed.ping_role_id}
                        </Badge>
                      )}
                    </Inline>
                  </Table.Cell>

                  <Table.Cell>
                    <FeedStatusBadge status={feed.status} />
                  </Table.Cell>

                  <Table.Cell>
                    <Text size="2xs" color="secondary">
                      {feed.last_checked_at
                        ? formatRelativeTime(feed.last_checked_at)
                        : t('common.never')}
                    </Text>
                  </Table.Cell>

                  <Table.Cell align="right">
                    <Inline justify="end" gap="2xs">
                      {onUpdateFeed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMonitor(feed)}
                          aria-label={t('common.edit')}
                        >
                          <Settings2 size={14} />
                        </Button>
                      )}
                      {onDeleteFeed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteFeed(feed.id)}
                          aria-label={t('common.delete')}
                        >
                          <Trash2 size={14} color="var(--status-danger)" />
                        </Button>
                      )}
                    </Inline>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      <FeedEditModal
        monitor={editingMonitor}
        isOpen={Boolean(editingMonitor)}
        onClose={() => setEditingMonitor(null)}
        onSave={handleSaveEdit}
        isSaving={isUpdating}
      />
    </>
  );
};
