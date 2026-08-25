"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Settings,
  RefreshCcw,
  Send,
  Trash2,
  Wrench,
  Check,
  AlertCircle,
} from 'lucide-react';
import { MonitorConfig } from '@/types/monitor';
import { PLATFORM_NAMES } from '@/constants/platforms';
import { getPlatformLogo, formatMonitorDate } from '@/utils';
import { useMonitorCardActions } from '@/hooks/use_monitor_card_actions';
import {
  Badge,
  Button,
  IconButton,
  Checkbox,
} from '@/components/ui';
import styles from './monitor_card.module.css';

export interface MonitorCardProps {
  monitor: MonitorConfig;
  onToggle: (id: number, enabled: boolean) => Promise<void>;
  onDelete: (id: number) => void;
  onEdit: (monitor: MonitorConfig) => void;
  isPremium: boolean;
  tier?: number;
  isSelected?: boolean;
  onSelect: (id: number) => void;
  selectionMode?: boolean;
}

export default function MonitorCard({
  monitor,
  onToggle,
  onDelete,
  onEdit,
  isPremium,
  tier = 0,
  isSelected = false,
  onSelect,
  selectionMode = false,
}: MonitorCardProps) {
  const {
    toggleLoading,
    showTools,
    setShowTools,
    actionLoading,
    actionStatus,
    repostCount,
    setRepostCount,
    purgeAmount,
    setPurgeAmount,
    canRepost,
    maxPurge,
    handleToggle,
    runAction,
  } = useMonitorCardActions({
    monitor,
    onToggle,
    tier,
    isPremium,
  });

  return (
    <div
      className={[
        styles['monitor-card'],
        !monitor.enabled && styles.paused,
        isSelected && styles.selected,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(selectionMode
        ? {
            role: 'button',
            tabIndex: 0,
            onClick: () => onSelect(monitor.id),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(monitor.id);
              }
            },
          }
        : {})}
    >
      {/* ── Card Top Header ── */}
      <div className={styles['card-top']}>
        <div className={styles['brand-wrapper']}>
          {selectionMode && (
            <Checkbox
              checked={isSelected}
              onChange={() => onSelect(monitor.id)}
            />
          )}

          <div className={styles['brand-icon-box']}>
            <Image
              src={getPlatformLogo(monitor.type)}
              alt=""
              width={20}
              height={20}
              unoptimized
            />
          </div>

          <span className={styles['brand-name']}>
            {PLATFORM_NAMES[monitor.type] || monitor.type.toUpperCase()}
          </span>
        </div>

        <div className={styles['top-actions']}>
          <IconButton
            icon={<Wrench size={14} />}
            size="xs"
            variant={showTools ? 'primary' : 'ghost'}
            aria-label="Toggle diagnostics"
            onClick={(e) => {
              e.stopPropagation();
              setShowTools(!showTools);
            }}
          />

          <Badge
            variant={monitor.enabled ? 'success' : 'neutral'}
            size="sm"
            dot
          >
            {monitor.enabled ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* ── Monitor Body ── */}
      <div className={styles['monitor-body']}>
        <h3 className={styles['monitor-name']}>{monitor.name}</h3>

        <div className={styles['monitor-meta-grid']}>
          <div className={styles['meta-item']}>
            <span className={styles['meta-label']}>Last Post</span>
            <span className={styles['meta-value']}>
              {formatMonitorDate(monitor.last_post_at)}
            </span>
          </div>

          <div className={styles['meta-item']}>
            <span className={styles['meta-label']}>Monitor ID</span>
            <code className={styles['meta-code']}>#{monitor.id}</code>
          </div>
        </div>
      </div>

      {/* ── Diagnostics Drawer ── */}
      {showTools && (
        <div className={styles['tools-panel']}>
          <div className={styles['tools-grid']}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                <RefreshCcw
                  size={14}
                  className={actionLoading === 'check' ? 'spin' : ''}
                />
              }
              disabled={Boolean(actionLoading)}
              onClick={(e) => {
                e.stopPropagation();
                runAction('check');
              }}
            >
              Force Check
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                <Send
                  size={14}
                  className={actionLoading === 'repost' ? 'pulse' : ''}
                />
              }
              disabled={Boolean(actionLoading) || !canRepost}
              onClick={(e) => {
                e.stopPropagation();
                runAction('repost');
              }}
            >
              Repost ({repostCount})
            </Button>

            {canRepost && (
              <div className={styles['slider-group']}>
                <div className={styles['slider-header']}>
                  <span>Repost Count</span>
                  <span>{repostCount}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={repostCount}
                  onChange={(e) =>
                    setRepostCount(parseInt(e.target.value, 10))
                  }
                  className={styles['slider-input']}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <Button
              variant="danger"
              size="sm"
              leftIcon={
                <Trash2
                  size={14}
                  className={actionLoading === 'purge' ? 'shake' : ''}
                />
              }
              disabled={Boolean(actionLoading)}
              onClick={(e) => {
                e.stopPropagation();
                runAction('purge');
              }}
            >
              Purge ({purgeAmount})
            </Button>

            <div className={styles['slider-group']}>
              <div className={styles['slider-header']}>
                <span>Purge Messages</span>
                <span>{purgeAmount}</span>
              </div>
              <input
                type="range"
                min={5}
                max={Math.min(100, maxPurge)}
                step={5}
                value={purgeAmount}
                onChange={(e) =>
                  setPurgeAmount(parseInt(e.target.value, 10))
                }
                className={styles['slider-input']}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {actionStatus.message && (
            <div
              className={[
                styles['action-feedback'],
                actionStatus.type === 'success'
                  ? styles['feedback-success']
                  : styles['feedback-error'],
              ].join(' ')}
            >
              {actionStatus.type === 'success' ? (
                <Check size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              <span>{actionStatus.message}</span>
            </div>
          )}

          {!isPremium && (
            <p className={styles['upgrade-caption']}>
              Upgrade to{' '}
              <Link
                href={`/dashboard/${monitor.guild_id}/billing`}
                className={styles['upgrade-link']}
              >
                Premium
              </Link>{' '}
              for higher limits and instant reposts.
            </p>
          )}
        </div>
      )}

      {/* ── Card Footer Actions ── */}
      <div className={styles['card-footer']}>
        <IconButton
          icon={<Settings size={16} />}
          size="sm"
          variant="secondary"
          aria-label="Edit monitor"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(monitor);
          }}
        />

        <Button
          variant={monitor.enabled ? 'secondary' : 'primary'}
          size="sm"
          fullWidth
          isLoading={toggleLoading}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {monitor.enabled ? 'Pause' : 'Resume'}
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(monitor.id);
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
