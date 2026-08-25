import api from './api_client';
import { StructuredLogEntry } from '@/utils/log';

export interface PremiumKey {
  code: string;
  duration_days: number;
  max_uses: number;
  used_count: number;
  tier: number;
  is_revoked: boolean;
  created_at: string;
}

export type PremiumKeyItem = PremiumKey;

export interface BotStatusItem {
  id: number;
  text: string;
  type: string;
  created_at?: string;
}

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'alert' | 'maintenance';
  is_active: boolean;
  created_at?: string;
}

export interface SystemLogsResponse {
  logs?: StructuredLogEntry[];
  error?: string;
}

const devService = {
  // System Logs
  async getLogs(lines = 100): Promise<SystemLogsResponse> {
    return api.get<SystemLogsResponse>(`/api/admin/logs?lines=${lines}`);
  },

  // Premium Keys
  async getKeys(): Promise<PremiumKey[]> {
    return api.get<PremiumKey[]>('/api/admin/keys');
  },
  async generateKey(days: number, uses: number, tier: number): Promise<any> {
    return api.post('/api/admin/keys/generate', { days, uses, tier });
  },
  async deleteKey(code: string): Promise<any> {
    return api.delete(`/api/admin/keys?code=${code}`);
  },
  async revokeKey(code: string): Promise<any> {
    return api.patch(`/api/admin/keys?code=${code}`);
  },

  // Bot Statuses
  async getStatuses(): Promise<BotStatusItem[]> {
    return api.get<BotStatusItem[]>('/api/admin/status');
  },
  async addStatus(type: string, text: string): Promise<any> {
    return api.post('/api/admin/status', { type, text });
  },
  async deleteStatus(id: number): Promise<any> {
    return api.delete(`/api/admin/status?id=${id}`);
  },

  // Bot Settings
  async getBotSettings(): Promise<{ status_rotation_mode: string; presence_interval_seconds: string }> {
    return api.get('/api/admin/settings');
  },
  async updateBotSetting(key: string, value: any): Promise<any> {
    return api.patch('/api/admin/settings', { key, value });
  },

  // Announcements
  async getAnnouncements(): Promise<AnnouncementItem[]> {
    return api.get<AnnouncementItem[]>('/api/admin/announcements');
  },
  async createAnnouncement(data: { title: string; content: string; type: string; expires_at?: string | null }): Promise<any> {
    return api.post('/api/admin/announcements', data);
  },
  async addAnnouncement(data: { title: string; content: string; type: string; expires_at?: string | null }): Promise<any> {
    return this.createAnnouncement(data);
  },
  async deleteAnnouncement(id?: number): Promise<any> {
    const url = id ? `/api/admin/announcements?id=${id}` : '/api/admin/announcements';
    return api.delete(url);
  },

  // Maintenance
  async resetAllHistories(): Promise<any> {
    return api.post('/api/admin/reset', { action: 'reset' });
  },
  async resetHistory(): Promise<any> {
    return this.resetAllHistories();
  },
  async factoryReset(): Promise<any> {
    return api.post('/api/admin/reset', { action: 'factory' });
  }
};

export default devService;
