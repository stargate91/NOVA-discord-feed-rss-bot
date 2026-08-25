import { useState, useEffect, useMemo, useCallback } from 'react';
import monitorService from '@/services/monitor_service';
import guildService from '@/services/guild_service';
import { MonitorConfig } from '@/types/monitor';
import { useToast } from '@/context/toast_context';

export function useMonitors(guildId: string) {
  const { addToast } = useToast();

  const [monitors, setMonitors] = useState<MonitorConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isPremium, setIsPremium] = useState(false);
  const [tier, setTier] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const platforms = useMemo(() => {
    return ['all', ...Array.from(new Set(monitors.map((m) => m.type)))];
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
        const [fetchedMonitors, guilds] = await Promise.all([
          monitorService.getMonitors(guildId),
          guildService.getGuilds(),
        ]);
        if (ignore) return;
        setMonitors(fetchedMonitors);

        const current = guilds.find((g: any) => String(g.id) === String(guildId));
        if (current) {
          setIsPremium(Boolean(current.isPremium || current.isMaster));
          setTier(current.isMaster ? 0 : current.tier || 0);
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

  const deleteMonitor = async (id: number) => {
    try {
      await monitorService.deleteMonitor(id);
      setMonitors((prev) => prev.filter((m) => m.id !== id));
      addToast('Monitor deleted successfully', 'success');
      return true;
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete monitor', 'error');
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
  };
}
