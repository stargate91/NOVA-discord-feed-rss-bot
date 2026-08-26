import { useState, useCallback } from 'react';
import monitorService, {
  CreateMonitorPayload,
  UpdateMonitorPayload,
  BulkAddPayload,
  BulkAddResponse,
  MonitorActionType,
} from '@/services/monitor_service';
import { MonitorConfig } from '@/types/monitor';
import { useToast } from '@/context/toast_context';
import { TOAST_MESSAGES } from '@/constants/toasts';
import { extractErrorMessage } from '@/utils/toast';

export interface UseMonitorMutationsReturn {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  togglingId: number | string | null;
  bulkProcessing: boolean;
  actionLoading: string | null;
  createMonitor: (payload: CreateMonitorPayload, customName?: string) => Promise<MonitorConfig | null>;
  updateMonitor: (id: number | string, data: UpdateMonitorPayload | Partial<MonitorConfig>) => Promise<boolean>;
  deleteMonitor: (id: number | string) => Promise<boolean>;
  toggleMonitor: (id: number | string, enabled: boolean) => Promise<boolean>;
  triggerAction: (
    id: number | string,
    action: MonitorActionType,
    params?: { count?: number }
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  bulkAddMonitors: (payload: BulkAddPayload) => Promise<BulkAddResponse | null>;
  bulkUpdateMonitors: (guildId: string | number, monitorIds: number[], data: Record<string, any>) => Promise<boolean>;
  bulkToggleMonitors: (guildId: string | number, monitorIds: number[], enable: boolean) => Promise<boolean>;
  bulkDeleteMonitors: (guildId: string | number, monitorIds: number[]) => Promise<boolean>;
}

export function useMonitorMutations(): UseMonitorMutationsReturn {
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const createMonitor = useCallback(async (payload: CreateMonitorPayload, customName?: string): Promise<MonitorConfig | null> => {
    setCreating(true);
    try {
      const created = await monitorService.createMonitor(payload);
      toast.success(TOAST_MESSAGES.MONITOR.CREATE_SUCCESS(customName || payload.name), 'Success');
      return created;
    } catch (err: unknown) {
      console.error('Failed to create monitor:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.CREATE_ERROR, 'Creation Failed');
      return null;
    } finally {
      setCreating(false);
    }
  }, [toast]);

  const updateMonitor = useCallback(async (id: number | string, data: UpdateMonitorPayload | Partial<MonitorConfig>): Promise<boolean> => {
    setUpdating(true);
    try {
      await monitorService.updateMonitor(id, data);
      toast.success(TOAST_MESSAGES.MONITOR.UPDATE_SUCCESS);
      return true;
    } catch (err: unknown) {
      console.error('Failed to update monitor:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.UPDATE_ERROR);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [toast]);

  const deleteMonitor = useCallback(async (id: number | string): Promise<boolean> => {
    setDeleting(true);
    try {
      await monitorService.deleteMonitor(id);
      toast.success(TOAST_MESSAGES.MONITOR.DELETE_SUCCESS);
      return true;
    } catch (err: unknown) {
      console.error('Failed to delete monitor:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.DELETE_ERROR);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [toast]);

  const toggleMonitor = useCallback(async (id: number | string, enabled: boolean): Promise<boolean> => {
    setTogglingId(id);
    try {
      await monitorService.toggleMonitor(id, enabled);
      toast.info(TOAST_MESSAGES.MONITOR.TOGGLE_SUCCESS(enabled));
      return true;
    } catch (err: unknown) {
      console.error('Failed to toggle monitor:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.TOGGLE_ERROR);
      return false;
    } finally {
      setTogglingId(null);
    }
  }, [toast]);

  const triggerAction = useCallback(async (
    id: number | string,
    action: MonitorActionType,
    params?: { count?: number }
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    setActionLoading(action);
    try {
      const data = await monitorService.triggerAction(id, action, params);
      if (data.success !== false) {
        return { success: true, message: data.message || 'Success!' };
      }
      return { success: false, error: data.error || 'Failed' };
    } catch (err: unknown) {
      const errMsg = extractErrorMessage(err, 'Connection error');
      return { success: false, error: errMsg };
    } finally {
      setActionLoading(null);
    }
  }, []);

  const bulkAddMonitors = useCallback(async (payload: BulkAddPayload): Promise<BulkAddResponse | null> => {
    setBulkProcessing(true);
    try {
      const res = await monitorService.bulkAddMonitors(payload);
      return res;
    } catch (err: unknown) {
      console.error('Failed to bulk add monitors:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.BULK_ADD_ERROR, 'Processing Failed');
      return null;
    } finally {
      setBulkProcessing(false);
    }
  }, [toast]);

  const bulkUpdateMonitors = useCallback(async (
    guildId: string | number,
    monitorIds: number[],
    data: Record<string, any>
  ): Promise<boolean> => {
    setBulkProcessing(true);
    try {
      await monitorService.bulkUpdate(guildId, monitorIds, data);
      toast.success(TOAST_MESSAGES.MONITOR.BULK_UPDATE_SUCCESS);
      return true;
    } catch (err: unknown) {
      console.error('Failed to bulk update monitors:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.BULK_UPDATE_ERROR);
      return false;
    } finally {
      setBulkProcessing(false);
    }
  }, [toast]);

  const bulkToggleMonitors = useCallback(async (
    guildId: string | number,
    monitorIds: number[],
    enable: boolean
  ): Promise<boolean> => {
    if (monitorIds.length === 0) return false;
    setBulkProcessing(true);
    try {
      await monitorService.bulkToggle(guildId, monitorIds, enable ? 'resume' : 'pause');
      toast.success(TOAST_MESSAGES.MONITOR.BULK_TOGGLE_SUCCESS(monitorIds.length, enable));
      return true;
    } catch (err: unknown) {
      console.error('Failed to bulk toggle monitors:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.TOGGLE_ERROR);
      return false;
    } finally {
      setBulkProcessing(false);
    }
  }, [toast]);

  const bulkDeleteMonitors = useCallback(async (
    guildId: string | number,
    monitorIds: number[]
  ): Promise<boolean> => {
    if (monitorIds.length === 0) return false;
    setBulkProcessing(true);
    try {
      await monitorService.bulkDelete(guildId, monitorIds);
      toast.success(TOAST_MESSAGES.MONITOR.BULK_DELETE_SUCCESS);
      return true;
    } catch (err: unknown) {
      console.error('Failed to bulk delete monitors:', err);
      toast.error(err, TOAST_MESSAGES.MONITOR.BULK_DELETE_ERROR);
      return false;
    } finally {
      setBulkProcessing(false);
    }
  }, [toast]);

  return {
    creating,
    updating,
    deleting,
    togglingId,
    bulkProcessing,
    actionLoading,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    toggleMonitor,
    triggerAction,
    bulkAddMonitors,
    bulkUpdateMonitors,
    bulkToggleMonitors,
    bulkDeleteMonitors,
  };
}

export default useMonitorMutations;
