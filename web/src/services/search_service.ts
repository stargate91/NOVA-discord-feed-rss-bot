import api from './api_client';
import { getPlatformSearchDomain } from '@/utils/platform';

export interface YouTubeResolvedChannel {
  id: string;
  title: string;
  thumbnail?: string;
  description?: string;
  customUrl?: string;
}

export interface PlatformSearchResult {
  id: string;
  name: string;
  icon?: string;
  thumbnail?: string;
  banner?: string;
  description?: string;
  subtitle?: string;
  type?: string;
  is_live?: boolean;
  [key: string]: any;
}


export interface ResolvedSourceResult {
  type: string;
  canonicalId: string;
  name: string;
  apiUrl: string;
  suggestedName?: string;
  extra?: Record<string, any>;
}

export const searchService = {
  async resolveYouTube(input: string): Promise<YouTubeResolvedChannel> {
    if (!input.trim()) throw new Error('Input is required');
    return api.get<YouTubeResolvedChannel>(`/api/search/youtube?input=${encodeURIComponent(input.trim())}`);
  },

  async resolveSource(input: string, type?: string): Promise<ResolvedSourceResult> {
    if (!input.trim()) throw new Error('Input is required');
    return api.post<ResolvedSourceResult>('/api/search/resolve', { input: input.trim(), type });
  },

  async searchPlatform(platform: string, query: string): Promise<PlatformSearchResult[]> {
    if (!query.trim()) return [];
    const searchDomain = getPlatformSearchDomain(platform);
    return api.get<PlatformSearchResult[]>(`/api/search/${searchDomain}?q=${encodeURIComponent(query.trim())}`);
  }
};

export default searchService;

