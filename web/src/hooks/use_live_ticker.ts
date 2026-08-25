import { useState, useEffect } from 'react';
import statsService, { TickerItem } from '@/services/stats_service';

const FALLBACK_TICKER_ITEMS: TickerItem[] = [
  { platform: 'youtube', title: 'New video from NovaFeeds Official', author_name: 'NovaFeeds' },
  { platform: 'twitch', title: 'Stream is LIVE: Dashboard Showcase', author_name: 'NovaBot' },
  { platform: 'rss', title: 'Update: Version 2.0 released', author_name: 'Changelog' },
];

export function useLiveTicker(intervalMs: number = 30000) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchTicker() {
      try {
        const data = await statsService.getGlobalTicker();
        if (!ignore) {
          if (data && data.length > 0) {
            setItems(data);
          } else {
            setItems(FALLBACK_TICKER_ITEMS);
          }
        }
      } catch (err) {
        console.error('Ticker fetch error:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchTicker();
    const interval = setInterval(fetchTicker, intervalMs);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [intervalMs]);

  return {
    items,
    loading,
  };
}
