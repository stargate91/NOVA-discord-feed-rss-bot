export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private subscribers: Map<string, Set<(data: unknown) => void>> = new Map();

  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    return entry.data as T;
  }

  public isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  public set<T>(key: string, data: T, ttlMs: number = 60000): void {
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
}

export const queryCache = new QueryCache();
