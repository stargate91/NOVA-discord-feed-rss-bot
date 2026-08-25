import { useState, useEffect } from 'react';
import searchService, { PlatformSearchResult } from '@/services/search_service';

export function usePlatformSearch(platformId?: string, debounceMs: number = 350) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlatformSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supportedPlatforms = ['steam_news', 'twitch', 'github'];
  const isValidPlatform = Boolean(platformId && supportedPlatforms.includes(platformId));
  const isQueryValid = query.trim().length >= 3;

  useEffect(() => {
    if (!isValidPlatform || !isQueryValid || !platformId) {
      return;
    }

    let ignore = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const data = await searchService.searchPlatform(platformId, query.trim());
        if (!ignore) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (!ignore) {
          console.warn(`[usePlatformSearch] Search failed for ${platformId}:`, err?.message);
          setError(err?.message || 'Search failed');
          setResults([]);
        }
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, platformId, debounceMs, isValidPlatform, isQueryValid]);

  const displayResults = isValidPlatform && isQueryValid ? results : [];

  const resolveYouTube = async (input: string) => {
    if (!input.trim()) return null;
    setIsResolving(true);
    setError(null);
    try {
      const data = await searchService.resolveYouTube(input.trim());
      return data;
    } catch (err: any) {
      setError(err?.message || 'Could not find YouTube channel');
      throw err;
    } finally {
      setIsResolving(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results: displayResults,
    isSearching: isValidPlatform && isQueryValid ? isSearching : false,
    isResolving,
    error,
    resolveYouTube,
    clear,
  };
}
