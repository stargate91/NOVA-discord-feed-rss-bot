import api from './api_client';

export interface TickerItem {
  platform: string;
  title: string;
  author_name?: string;
  published_at?: string;
}

export const statsService = {
  async getGlobalTicker(): Promise<TickerItem[]> {
    return api.get<TickerItem[]>('/api/stats/global');
  },

  async getGuildStats(guildId: string, range = '3'): Promise<any> {
    if (!guildId) throw new Error('Guild ID is required');
    return api.get<any>(`/api/stats?guild=${guildId}&range=${range}`);
  }
};

export default statsService;
