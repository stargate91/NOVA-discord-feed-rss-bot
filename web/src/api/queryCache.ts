export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface QueryCacheOptions {
  maxEntries?: number;
}

export class QueryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private subscribers: Map<string, Set<(data: unknown) => void>> = new Map();
  private maxEntries: number;

  public constructor(options: QueryCacheOptions = {}) {
    this.maxEntries = options.maxEntries ?? 200;
  }

  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // LRU recency update: re-insert key to maintain true LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data as T;
  }

  public isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  public set<T>(key: string, data: T, ttlMs: number = 60000): void {
    // If key exists, delete it so re-insertion places it at the end (most recent)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // LRU Eviction: Remove the oldest entry (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    const keySubs = this.subscribers.get(key);
    if (keySubs) {
      keySubs.forEach((cb) => {
        try {
          cb(data);
        } catch {
          // Ignore subscriber errors
        }
      });
    }
  }

  public subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    const keySubs = this.subscribers.get(key)!;
    const sub = callback as (data: unknown) => void;
    keySubs.add(sub);

    return () => {
      keySubs.delete(sub);
      if (keySubs.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  public invalidate(keyOrPattern?: string | RegExp): void {
    if (!keyOrPattern) {
      this.cache.clear();
      return;
    }

    if (typeof keyOrPattern === 'string') {
      this.cache.delete(keyOrPattern);
      return;
    }

    for (const key of this.cache.keys()) {
      if (keyOrPattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  public getMaxEntries(): number {
    return this.maxEntries;
  }

  public setMaxEntries(max: number): void {
    this.maxEntries = max;
    while (this.cache.size > this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }
  }
}

export const queryCache = new QueryCache();
