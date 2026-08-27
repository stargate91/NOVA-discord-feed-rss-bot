import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryCache } from '@/api/queryCache';

describe('QueryCache Unit Tests', () => {
  beforeEach(() => {
    queryCache.clear();
  });

  it('should store and retrieve data by key', () => {
    queryCache.set('guild_123', { name: 'Nova Gaming' }, 5000);
    const retrieved = queryCache.get<{ name: string }>('guild_123');
    expect(retrieved).toEqual({ name: 'Nova Gaming' });
  });

  it('should correctly identify stale cache entries based on TTL', async () => {
    queryCache.set('short_lived', 'temporary', 20);
    expect(queryCache.isStale('short_lived')).toBe(false);

    await new Promise((r) => setTimeout(r, 30));
    expect(queryCache.isStale('short_lived')).toBe(true);
  });

  it('should notify subscribers when key value is updated', () => {
    const subscriber = vi.fn();
    const unsubscribe = queryCache.subscribe('feeds_list', subscriber);

    queryCache.set('feeds_list', [{ id: 1 }, { id: 2 }]);
    expect(subscriber).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);

    unsubscribe();
    queryCache.set('feeds_list', [{ id: 3 }]);
    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it('should invalidate keys by exact string, regex pattern, or all', () => {
    queryCache.set('guild_1_feeds', [1]);
    queryCache.set('guild_1_analytics', [2]);
    queryCache.set('guild_2_feeds', [3]);

    // Invalidate by regex
    queryCache.invalidate(/^guild_1_/);
    expect(queryCache.get('guild_1_feeds')).toBeUndefined();
    expect(queryCache.get('guild_1_analytics')).toBeUndefined();
    expect(queryCache.get('guild_2_feeds')).toEqual([3]);

    // Invalidate by exact key
    queryCache.invalidate('guild_2_feeds');
    expect(queryCache.get('guild_2_feeds')).toBeUndefined();
  });
});
