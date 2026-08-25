"use client";

import React, { useState } from 'react';
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
import { useConfig } from '@/hooks/use_config';
import { MonitorConfig } from '@/types/monitor';
import { PLATFORM_NAMES } from '@/constants/platforms';
import { getPlatformLogo } from '@/utils';
import monitorService from '@/services/monitor_service';
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Never';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleToggle = async () => {
    setToggleLoading(true);
    await onToggle(monitor.id, !monitor.enabled);
    setToggleLoading(false);
  };

  const runAction = async (action: 'check' | 'repost' | 'purge') => {
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
  };

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
              {formatDate(monitor.last_post_at)}
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
