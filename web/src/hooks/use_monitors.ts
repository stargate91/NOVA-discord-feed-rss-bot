import { useState, useEffect, useMemo, useCallback } from 'react';
import monitorService from '@/services/monitor_service';
import guildService from '@/services/guild_service';
import settingsService from '@/services/settings_service';
import { MonitorConfig } from '@/types/monitor';
import { GuildFeatures } from '@/types/guild';
import { PLATFORM_NAMES } from '@/constants/platforms';
import { useToast } from '@/context/toast_context';

interface UseMonitorsOptions {
  initialAddOpen?: boolean;
  initialBulkOpen?: boolean;
}

export function useMonitors(guildId: string, options?: UseMonitorsOptions) {
  const { addToast } = useToast();

  const [monitors, setMonitors] = useState<MonitorConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isPremium, setIsPremium] = useState(false);
  const [tier, setTier] = useState(0);
  const [features, setFeatures] = useState<GuildFeatures | undefined>(undefined);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('add') || url.searchParams.has('bulk')) {
        url.searchParams.delete('add');
        url.searchParams.delete('bulk');
        const newUrl = url.pathname + (url.search ? url.search : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

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
        const [fetchedMonitors, guilds, settingsData] = await Promise.all([
          monitorService.getMonitors(guildId),
          guildService.getGuilds().catch(() => []),
          settingsService.getSettings(guildId).catch(() => null),
        ]);
        if (ignore) return;
        setMonitors(fetchedMonitors);

        if (settingsData?.features) {
          setFeatures(settingsData.features);
          setIsPremium(settingsData.features.isPremium);
          setTier(settingsData.features.tier);
        } else {
          const current = guilds.find((g: any) => String(g.id) === String(guildId));
          if (current) {
            setIsPremium(Boolean(current.isPremium || current.isMaster));
            setTier(current.isMaster ? 0 : current.tier || 0);
          }
        }
      } catch (err: any) {
        console.error('Failed to load monitors:', err);
        addToast(err?.message || 'Failed to sync server data', 'error');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [guildId, addToast]);

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
      await monitorService.deleteMonitor(monitorToDelete.id);
      setMonitors((prev) => prev.filter((m) => m.id !== monitorToDelete.id));
      addToast('Monitor deleted successfully', 'success');
      setMonitorToDelete(null);
      return true;
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete monitor', 'error');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateMonitor = async (
    id: number,
    data: Partial<MonitorConfig> & Record<string, any>
  ): Promise<boolean> => {
    try {
      await monitorService.updateMonitor(id, data);
      addToast('Monitor updated successfully', 'success');
      await reloadMonitors();
      setIsEditModalOpen(false);
      setEditingMonitor(null);
      return true;
    } catch (err: any) {
      addToast(err?.message || 'Failed to update monitor', 'error');
      return false;
    }
  };

  const handleBulkUpdateMonitors = async (data: Record<string, any>): Promise<boolean> => {
    try {
      const idsToUpdate = selectedIds.length ? selectedIds : monitors.map((m) => m.id);
      await monitorService.bulkUpdate(guildId, idsToUpdate, data);
      addToast('Monitors updated', 'success');
      await reloadMonitors();
      setIsBulkEditOpen(false);
      return true;
    } catch (err: any) {
      addToast(err?.message || 'Failed to bulk update monitors', 'error');
      return false;
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
      await reloadMonitors();
    } catch (err: any) {
      addToast(err?.message || 'Failed to toggle selected monitors', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await monitorService.bulkDelete(guildId, selectedIds);
      addToast(`Deleted ${selectedIds.length} monitor(s)`, 'success');
      setSelectedIds([]);
      await reloadMonitors();
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete monitors', 'error');
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

  const filteredMonitors = useMemo(() => {
    return monitors.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        String(m.id).includes(search);
      const matchesPlatform = filter === 'all' || m.type === filter;
      return matchesSearch && matchesPlatform;
    });
  }, [monitors, search, filter]);

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

  const isAllSelected =
    filteredMonitors.length > 0 && selectedIds.length === filteredMonitors.length;

  const selectAllButtonLabel = isAllSelected ? 'Deselect All' : 'Select All';

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

