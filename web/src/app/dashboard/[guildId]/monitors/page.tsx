"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Globe,
  Zap,
  X,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Button,
  IconButton,
  Badge,
  Input,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  EmptyState,
  Spinner,
  Inline,
  Stack,
} from '@/components/ui';
import MonitorCard from '@/components/MonitorCard';
import EditMonitorModal from '@/components/EditMonitorModal';
import CreateMonitorModal from '@/components/CreateMonitorModal';
import BulkEditModal from '@/components/BulkEditModal';
import BulkAddModal from '@/components/BulkAddModal';
import { useToast } from '@/context/ToastContext';
import monitorService from '@/services/monitorService';
import guildService from '@/services/guildService';
import { MonitorConfig } from '@/types/monitor';
import { PLATFORM_NAMES } from '@/constants/platforms';
import { getPlatformLogo } from '@/utils';
import styles from './monitors.module.css';

function MonitorsContent() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const guildId = (params?.guildId as string) || searchParams?.get('guild') || '';
  const { addToast, showSuccess } = useToast();

  const [monitors, setMonitors] = useState<MonitorConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isPremium, setIsPremium] = useState(false);
  const [tier, setTier] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<MonitorConfig | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<MonitorConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const platforms = useMemo(() => {
    return ['all', ...Array.from(new Set(monitors.map((m) => m.type)))];
  }, [monitors]);

  const loadData = async () => {
    if (!guildId) return;
    setLoading(true);
    try {
      const [fetchedMonitors, guilds] = await Promise.all([
        monitorService.getMonitors(guildId),
        guildService.getGuilds(),
      ]);
      setMonitors(fetchedMonitors);

      const current = guilds.find((g: any) => String(g.id) === String(guildId));
      if (current) {
        setIsPremium(current.isPremium || current.isMaster || false);
        setTier(current.isMaster ? 0 : current.tier || 0);
      }
    } catch (err: any) {
      console.error('Failed to load monitors:', err);
      addToast(err?.message || 'Failed to sync server data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const reloadMonitors = async () => {
    if (!guildId) return;
    try {
      const fetchedMonitors = await monitorService.getMonitors(guildId);
      setMonitors(fetchedMonitors);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId]);

  useEffect(() => {
    const addParam = searchParams?.get('add');
    const bulkParam = searchParams?.get('bulk');

    if (addParam === 'true') setIsCreateModalOpen(true);
    if (bulkParam === 'true') setIsBulkAddOpen(true);

    if (addParam === 'true' || bulkParam === 'true') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, guildId]);

  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      await monitorService.toggleMonitor(id, enabled);
      setMonitors((prev) =>
        prev.map((m) => (m.id === id ? { ...m, enabled } : m))
      );
      addToast(`Monitor ${enabled ? 'resumed' : 'paused'}`, 'info');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update monitor', 'error');
    }
  };

  const handleDelete = (id: number) => {
    const monitor = monitors.find((m) => m.id === id);
    if (monitor) setMonitorToDelete(monitor);
  };

  const confirmDelete = async () => {
    if (!monitorToDelete) return;
    setIsDeleting(true);
    try {
      await monitorService.deleteMonitor(monitorToDelete.id);
      setMonitors((prev) => prev.filter((m) => m.id !== monitorToDelete.id));
      addToast('Monitor deleted successfully', 'success');
      setMonitorToDelete(null);
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete monitor', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkToggle = async (enable: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => monitorService.toggleMonitor(id, enable))
      );
      addToast(
        `${selectedIds.length} monitor(s) ${enable ? 'resumed' : 'paused'}`,
        'success'
      );
      setSelectedIds([]);
      reloadMonitors();
    } catch (err) {
      addToast('Failed to toggle selected monitors', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await monitorService.bulkDelete(guildId, selectedIds);
      addToast(`Deleted ${selectedIds.length} monitor(s)`, 'success');
      setSelectedIds([]);
      reloadMonitors();
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete monitors', 'error');
    }
  };

  const handleSelectMonitor = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMonitors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMonitors.map((m) => m.id));
    }
  };

  const filteredMonitors = useMemo(() => {
    return monitors.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        String(m.id).includes(search);
      const matchesPlatform = filter === 'all' || m.type === filter;
      return matchesSearch && matchesPlatform;
    });
  }, [monitors, search, filter]);

  const activeCount = monitors.filter((m) => m.enabled).length;

  return (
    <div className={styles['monitors-container']}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Feed Monitors"
        description="Configure automated feeds, diagnostic actions, and alert delivery."
        badge={
          <Badge variant="primary" size="sm">
            {activeCount} Active / {monitors.length} Total
          </Badge>
        }
        actions={
          <Inline gap="sm" wrap>
            <Button
              variant={selectionMode ? 'primary' : 'secondary'}
              size="md"
              leftIcon={selectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) setSelectedIds([]);
              }}
            >
              {selectionMode ? 'Exit Select' : 'Select'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Zap size={16} />}
              onClick={() => setIsBulkAddOpen(true)}
            >
              Bulk Wizard
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Add Monitor
            </Button>
          </Inline>
        }
      />

      {/* ── Controls Bar ── */}
      <div className={styles['controls-bar']}>
        <div className={styles['search-row']}>
          <div className={styles['search-input-wrapper']}>
            <Input
              placeholder="Search monitors by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              rightIcon={
                search ? (
                  <IconButton
                    icon={<X size={14} />}
                    size="xs"
                    variant="ghost"
                    aria-label="Clear search"
                    onClick={() => setSearch('')}
                  />
                ) : undefined
              }
            />
          </div>

          {selectionMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedIds.length === filteredMonitors.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          )}
        </div>

        {/* Platform Filter Tabs */}
        <div className={styles['filter-scroll-wrapper']}>
          <div className={styles['filter-tabs']}>
            {platforms.map((p) => {
              const count =
                p === 'all'
                  ? monitors.length
                  : monitors.filter((m) => m.type === p).length;

              return (
                <button
                  key={p}
                  type="button"
                  className={[
                    styles['filter-chip'],
                    filter === p && styles.active,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setFilter(p)}
                >
                  <span className={styles['chip-icon']}>
                    {p === 'all' ? (
                      <Globe size={14} />
                    ) : (
                      <img
                        src={getPlatformLogo(p)}
                        alt=""
                        width={14}
                        height={14}
                      />
                    )}
                  </span>
                  <span>{PLATFORM_NAMES[p] || p.toUpperCase()}</span>
                  <span className={styles['chip-count']}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <Stack align="center" justify="center" gap="lg" style={{ paddingBlock: '4rem' }}>
          <Spinner size="lg" label="Loading monitors..." />
        </Stack>
      )}

      {/* ── Empty State ── */}
      {!loading && filteredMonitors.length === 0 && (
        <EmptyState
          icon={<Globe size={36} />}
          title={search || filter !== 'all' ? 'No matching monitors' : 'No monitors configured'}
          description={
            search || filter !== 'all'
              ? 'Try changing your search keywords or platform filters.'
              : 'Add your first feed monitor to start receiving notifications.'
          }
          action={
            search || filter !== 'all' ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Add Monitor
              </Button>
            )
          }
        />
      )}

      {/* ── Monitors Grid ── */}
      {!loading && filteredMonitors.length > 0 && (
        <div className={styles['monitors-grid']}>
          {filteredMonitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={(m) => {
                setEditingMonitor(m);
                setIsModalOpen(true);
              }}
              isPremium={isPremium}
              tier={tier}
              isSelected={selectedIds.includes(monitor.id)}
              onSelect={handleSelectMonitor}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      )}

      {/* ── Floating Action Bar for Selection ── */}
      {selectedIds.length > 0 && (
        <div className={styles['floating-bar']}>
          <span className={styles['selected-count']}>
            {selectedIds.length} Selected
          </span>

          <Inline gap="xs">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Play size={14} />}
              onClick={() => handleBulkToggle(true)}
            >
              Resume
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pause size={14} />}
              onClick={() => handleBulkToggle(false)}
            >
              Pause
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit3 size={14} />}
              onClick={() => setIsBulkEditOpen(true)}
            >
              Edit All
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={handleBulkDelete}
            >
              Delete
            </Button>
          </Inline>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {monitorToDelete && (
        <Modal
          isOpen={Boolean(monitorToDelete)}
          onClose={() => setMonitorToDelete(null)}
          size="sm"
        >
          <ModalHeader>
            <ModalTitle>Delete Monitor</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <p>
              Are you sure you want to delete{' '}
              <strong>{monitorToDelete.name}</strong>? This action cannot be
              undone.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => setMonitorToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={confirmDelete}
            >
              Confirm Delete
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ── Modals ── */}
      {isCreateModalOpen && (
        <CreateMonitorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          guildId={guildId}
          onSuccess={reloadMonitors}
          tier={tier}
          isPremium={isPremium}
        />
      )}

      {isModalOpen && editingMonitor && (
        <EditMonitorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMonitor(null);
          }}
          monitor={editingMonitor}
          guildId={guildId}
          onSave={async (id, data) => {
            try {
              await monitorService.updateMonitor(id, data);
              addToast('Monitor updated successfully', 'success');
              reloadMonitors();
              setIsModalOpen(false);
              return true;
            } catch (err: any) {
              addToast(err?.message || 'Failed to update monitor', 'error');
              return false;
            }
          }}
          tier={tier}
          isPremium={isPremium}
        />
      )}

      {isBulkAddOpen && (
        <BulkAddModal
          isOpen={isBulkAddOpen}
          onClose={() => setIsBulkAddOpen(false)}
          guildId={guildId}
          onSuccess={reloadMonitors}
          tier={tier}
          isPremium={isPremium}
        />
      )}

      {isBulkEditOpen && (
        <BulkEditModal
          isOpen={isBulkEditOpen}
          onClose={() => setIsBulkEditOpen(false)}
          guildId={guildId}
          monitorCount={selectedIds.length || monitors.length}
          onSave={async (data) => {
            await monitorService.bulkUpdate(guildId, selectedIds.length ? selectedIds : monitors.map(m => m.id), data);
            addToast('Monitors updated', 'success');
            reloadMonitors();
            setIsBulkEditOpen(false);
          }}
          tier={tier}
          isPremium={isPremium}
        />
      )}
    </div>
  );
}

export default function MonitorsPage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading..." />}>
      <MonitorsContent />
    </Suspense>
  );
}
