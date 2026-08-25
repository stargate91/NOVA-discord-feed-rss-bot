export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 60000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string, ttlMs: number = this.defaultTtlMs): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < ttlMs) {
      return entry.data as T;
    }
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  has(key: string, ttlMs: number = this.defaultTtlMs): boolean {
    return this.get(key, ttlMs) !== null;
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = this.defaultTtlMs,
    forceRefresh: boolean = false
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = this.get<T>(key, ttlMs);
      if (cached !== null) return cached;
    }

    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const data = await fetcher();
        this.set(key, data);
        return data;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidate(keyPrefix: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}
