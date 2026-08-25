"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
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
import MonitorCard from '@/components/monitor_card';
import EditMonitorModal from '@/components/edit_monitor_modal';
import CreateMonitorModal from '@/components/create_monitor_modal';
import BulkEditModal from '@/components/bulk_edit_modal';
import BulkAddModal from '@/components/bulk_add_modal';
import { useToast } from '@/context/toast_context';
import monitorService from '@/services/monitor_service';
import { MonitorConfig } from '@/types/monitor';
import { PLATFORM_NAMES } from '@/constants/platforms';
import { getPlatformLogo } from '@/utils';
import { useMonitors } from '@/hooks/use_monitors';
import styles from './monitors.module.css';

function MonitorsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const guildId = (params?.guildId as string) || searchParams?.get('guild') || '';
  const { addToast } = useToast();

  const {
    monitors,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    isPremium,
    tier,
    platforms,
    filteredMonitors,
    activeCount,
    selectedIds,
    setSelectedIds,
    selectionMode,
    setSelectionMode,
    reloadMonitors,
    handleToggle,
    deleteMonitor,
    handleBulkToggle,
    handleBulkDelete,
    handleSelectMonitor,
    handleSelectAll,
  } = useMonitors(guildId);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<MonitorConfig | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(() => searchParams?.get('add') === 'true');
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(() => searchParams?.get('bulk') === 'true');
  const [monitorToDelete, setMonitorToDelete] = useState<MonitorConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const addParam = searchParams?.get('add');
    const bulkParam = searchParams?.get('bulk');

    if (addParam === 'true' || bulkParam === 'true') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleDelete = (id: number) => {
    const monitor = monitors.find((m) => m.id === id);
    if (monitor) setMonitorToDelete(monitor);
  };

  const confirmDelete = async () => {
    if (!monitorToDelete) return;
    setIsDeleting(true);
    const success = await deleteMonitor(monitorToDelete.id);
    setIsDeleting(false);
    if (success) {
      setMonitorToDelete(null);
    }
  };

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
                      <Image
                        src={getPlatformLogo(p)}
                        alt=""
                        width={14}
                        height={14}
                        unoptimized
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
        <Stack align="center" justify="center" gap="lg" className={styles['loading-stack']}>
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
