import api from './api_client';
import { MonitorConfig } from '@/types/monitor';

export interface CreateMonitorPayload {
  guild_id: string;
  name: string;
  type: string;
  platform_input: string;
  channel_id: string;
  channel_ids?: string[];
  role_id?: string;
  role_ids?: string[];
  language?: string;
  custom_template?: string;
  embed_color?: string;
  [key: string]: any;
}

export interface BulkAddPayload {
  guildId: string;
  type: string;
  sources: string[];
  targetChannels: string[];
  targetRoles?: string[];
  embedColor?: string;
  sendInitialAlert?: boolean;
  use_native_player?: boolean;
  custom_image?: string;
  [key: string]: any;
}

export interface BulkAddResponse {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors?: string[];
}

export type MonitorActionType = 'check' | 'pause' | 'resume' | 'reset_history' | 'repost_latest' | 'purge';

export const monitorService = {
  async getMonitors(guildId: string | number): Promise<MonitorConfig[]> {
    if (!guildId) return [];
    return api.get<MonitorConfig[]>(`/api/monitors?guild=${guildId}`);
  },

  async createMonitor(payload: CreateMonitorPayload): Promise<MonitorConfig> {
    return api.post<MonitorConfig>('/api/monitors', payload);
  },

  async bulkAddMonitors(payload: BulkAddPayload): Promise<BulkAddResponse> {
    return api.post<BulkAddResponse>('/api/monitors/bulk-add', payload);
  },

  async toggleMonitor(id: number | string, enabled: boolean): Promise<any> {
    return api.patch(`/api/monitors/${id}`, { enabled });
  },

  async updateMonitor(id: number | string, data: Partial<MonitorConfig>): Promise<any> {
    return api.patch(`/api/monitors/${id}`, data);
  },

  async deleteMonitor(id: number | string): Promise<any> {
    return api.delete(`/api/monitors/${id}`);
  },

  async triggerAction(
    id: number | string, 
    action: MonitorActionType, 
    params?: { count?: number }
  ): Promise<{ success: boolean; message?: string; details?: any; [key: string]: any }> {
    return api.post(`/api/monitors/${id}/actions`, { action, ...params });
  },

  async bulkUpdate(guildId: string | number, monitorIds: number[], updateData: Record<string, any>): Promise<any> {
    return api.post('/api/monitors/bulk', { action: 'update', monitorIds, guildId, ...updateData });
  },

  async bulkToggle(guildId: string | number, monitorIds: number[], action: 'resume' | 'pause'): Promise<any> {
    return api.post('/api/monitors/bulk', { action, monitorIds, guildId });
  },

  async bulkDelete(guildId: string | number, monitorIds: number[]): Promise<any> {
    return api.post('/api/monitors/bulk', { action: 'delete', monitorIds, guildId });
  }
};

export default monitorService;
