import api from './api_client';

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
  banner?: string;
  description?: string;
  subtitle?: string;
  type?: string;
}

export const searchService = {
  async resolveYouTube(input: string): Promise<YouTubeResolvedChannel> {
    if (!input.trim()) throw new Error('Input is required');
    return api.get<YouTubeResolvedChannel>(`/api/search/youtube?input=${encodeURIComponent(input.trim())}`);
  },

  async searchPlatform(platform: string, query: string): Promise<PlatformSearchResult[]> {
    if (!query.trim()) return [];
    const searchDomain = platform === 'steam_news' ? 'steam' : platform;
    return api.get<PlatformSearchResult[]>(`/api/search/${searchDomain}?q=${encodeURIComponent(query.trim())}`);
  }
};

export default searchService;
