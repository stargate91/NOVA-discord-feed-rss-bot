import { useState, useEffect, useMemo, useCallback } from 'react';
import monitorService from '@/services/monitor_service';
import { MonitorConfig, UpdateMonitorPayload } from '@/types/monitor';
import { PLATFORM_NAMES } from '@/constants/platforms';
import { useToast } from '@/context/toast_context';
import { useGuildContext } from '@/context/guild_context';
import { TOAST_MESSAGES } from '@/constants/toasts';
import { useMonitorMutations } from './use_monitor_mutations';
import { useListSelection } from './use_list_selection';

interface UseMonitorsOptions {
  initialAddOpen?: boolean;
  initialBulkOpen?: boolean;
}

export function useMonitors(guildId: string, options?: UseMonitorsOptions) {
  const toast = useToast();
  const { isPremium, effectiveTier: tier, features, tierContext } = useGuildContext();

  const [monitors, setMonitors] = useState<MonitorConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(Boolean(options?.initialAddOpen));
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(Boolean(options?.initialBulkOpen));
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<MonitorConfig | null>(null);

  // Delete Confirmation State
  const [monitorToDelete, setMonitorToDelete] = useState<MonitorConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const platforms = useMemo(() => {
    return ['all', ...Array.from(new Set(monitors.map((m) => m.type)))];
  }, [monitors]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { all: monitors.length };
    for (const m of monitors) {
      counts[m.type] = (counts[m.type] || 0) + 1;
    }
    return counts;
  }, [monitors]);

  const reloadMonitors = useCallback(async () => {
    if (!guildId) return;
    try {
      const fetchedMonitors = await monitorService.getMonitors(guildId);
      setMonitors(fetchedMonitors);
    } catch (err: any) {
      console.error('Failed to reload monitors:', err);
    }
  }, [guildId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!guildId) return;
      try {
        setLoading(true);
        const fetchedMonitors = await monitorService.getMonitors(guildId);
        if (ignore) return;
        setMonitors(fetchedMonitors || []);
      } catch (err: any) {
        console.error('Failed to load monitors:', err);
        toast.error(err, TOAST_MESSAGES.MONITOR.SYNC_ERROR);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [guildId, toast]);

  const mutations = useMonitorMutations();

  const filteredMonitors = useMemo(() => {
    return monitors.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        String(m.id).includes(search);
      const matchesPlatform = filter === 'all' || m.type === filter;
      return matchesSearch && matchesPlatform;
    });
  }, [monitors, search, filter]);

  // Centralized List Selection for Monitored Items
  const {
    selectedIds,
    setSelectedIds,
    selectionMode,
    setSelectionMode,
    handleSelect: handleSelectMonitor,
    handleSelectAll,
    isAllSelected,
    selectAllButtonLabel,
  } = useListSelection<number>(filteredMonitors);

  const handleToggle = async (id: number, enabled: boolean) => {
    const success = await mutations.toggleMonitor(id, enabled);
    if (success) {
      setMonitors((prev) =>
        prev.map((m) => (m.id === id ? { ...m, enabled } : m))
      );
    }
  };

  const handleRequestDelete = (target: MonitorConfig | number) => {
    if (typeof target === 'number') {
      const found = monitors.find((m) => m.id === target);
      if (found) setMonitorToDelete(found);
    } else {
      setMonitorToDelete(target);
    }
  };

  const confirmDelete = async () => {
    if (!monitorToDelete) return false;
    setIsDeleting(true);
    try {
      const success = await mutations.deleteMonitor(monitorToDelete.id);
      if (success) {
        setMonitors((prev) => prev.filter((m) => m.id !== monitorToDelete.id));
        setMonitorToDelete(null);
      }
      return success;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateMonitor = async (
    id: number,
    data: UpdateMonitorPayload | Partial<MonitorConfig>
  ): Promise<boolean> => {
    const success = await mutations.updateMonitor(id, data);
    if (success) {
      await reloadMonitors();
      setIsEditModalOpen(false);
      setEditingMonitor(null);
    }
    return success;
  };

  const handleBulkUpdateMonitors = async (data: Record<string, any>): Promise<boolean> => {
    const idsToUpdate = selectedIds.length ? selectedIds : monitors.map((m) => m.id);
    const success = await mutations.bulkUpdateMonitors(guildId, idsToUpdate, data);
    if (success) {
      await reloadMonitors();
      setIsBulkEditOpen(false);
    }
    return success;
  };

  const handleBulkToggle = async (enable: boolean) => {
    if (selectedIds.length === 0) return;
    const success = await mutations.bulkToggleMonitors(guildId, selectedIds, enable);
    if (success) {
      setSelectedIds([]);
      await reloadMonitors();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const success = await mutations.bulkDeleteMonitors(guildId, selectedIds);
    if (success) {
      setSelectedIds([]);
      await reloadMonitors();
    }
  };

  const handleOpenEdit = (monitor: MonitorConfig) => {
    setEditingMonitor(monitor);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingMonitor(null);
  };


  const getPlatformCount = useCallback(
    (p: string) => platformCounts[p] || 0,
    [platformCounts]
  );

  const getPlatformDisplayName = useCallback(
    (p: string) => PLATFORM_NAMES[p] || p.toUpperCase(),
    []
  );

  const activeCount = useMemo(
    () => monitors.filter((m) => m.enabled).length,
    [monitors]
  );

  return {
    monitors,
    setMonitors,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    isPremium,
    tier,
    features,
    tierContext,
    platforms,
    platformCounts,
    filteredMonitors,
    activeCount,
    selectedIds,
    setSelectedIds,
    selectionMode,
    setSelectionMode,
    isAllSelected,
    selectAllButtonLabel,
    getPlatformCount,
    getPlatformDisplayName,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isBulkAddOpen,
    setIsBulkAddOpen,
    isBulkEditOpen,
    setIsBulkEditOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingMonitor,
    setEditingMonitor,
    handleOpenEdit,
    handleCloseEdit,
    monitorToDelete,
    setMonitorToDelete,
    isDeleting,
    handleRequestDelete,
    confirmDelete,
    reloadMonitors,
    handleToggle,
    handleUpdateMonitor,
    handleBulkUpdateMonitors,
    handleBulkToggle,
    handleBulkDelete,
    handleSelectMonitor,
    handleSelectAll,
  };
}

