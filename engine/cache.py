import threading
import time
from typing import Any
from collections import OrderedDict
from logger import log
from models.guild import GuildSettings
from core.constants import (
    DEFAULT_GUILD_CACHE_MAX_SIZE,
    DEFAULT_SHARED_CACHE_MAX_SIZE,
    DEFAULT_SHARED_CACHE_TTL_SECONDS,
)

class SharedDataCache:
    """
    Thread-safe in-memory cache with per-item TTL, auto-eviction, size constraints,
    and automatic garbage collection for monitor feeds.
    Protected by reentrant lock (threading.RLock).
    """

    def __init__(
        self,
        default_ttl: int = DEFAULT_SHARED_CACHE_TTL_SECONDS,
        max_size: int = DEFAULT_SHARED_CACHE_MAX_SIZE,
    ):
        self.default_ttl = default_ttl
        self.max_size = max_size
        self._lock = threading.RLock()
        # key -> (timestamp, data, ttl)
        self._shared_cache: dict[str, tuple[float, Any, int]] = {}
        self.tmdb_genres_cache: dict[str, dict[int, str]] = {}
        self._last_auto_cleanup = time.time()
        self._cleanup_interval = 300  # Opportunistic cleanup every 5 minutes

    def get_shared_data(self, key: str, max_age_seconds: int | None = None) -> Any:
        """Get shared data from cache if it is still within the max_age threshold."""
        with self._lock:
            self._maybe_auto_cleanup()

            if key in self._shared_cache:
                ts, data, item_ttl = self._shared_cache[key]
                ttl = max_age_seconds if max_age_seconds is not None else item_ttl
                if time.time() - ts < ttl:
                    return data
                else:
                    # Expired on read - evict immediately
                    del self._shared_cache[key]
                return None
            return None

    def set_shared_data(self, key: str, data: Any, ttl: int | None = None):
        """Store data in the shared cache with timestamp and enforce size limits."""
        with self._lock:
            self._maybe_auto_cleanup()

            item_ttl = ttl if ttl is not None else self.default_ttl

            # Enforce max size limit
            if len(self._shared_cache) >= self.max_size and key not in self._shared_cache:
                self.cleanup_expired()
                if len(self._shared_cache) >= self.max_size:
                    # Still full: evict oldest 10% of items
                    sorted_keys = sorted(self._shared_cache.keys(), key=lambda k: self._shared_cache[k][0])
                    evict_count = max(1, len(sorted_keys) // 10)
                    for k in sorted_keys[:evict_count]:
                        self._shared_cache.pop(k, None)

            self._shared_cache[key] = (time.time(), data, item_ttl)

    def cleanup_expired(self) -> int:
        """Remove all expired entries from cache and return count of evicted keys."""
        with self._lock:
            now = time.time()
            expired_keys = [
                k for k, (ts, _, ttl) in self._shared_cache.items()
                if now - ts >= ttl
            ]
            for k in expired_keys:
                del self._shared_cache[k]

            if expired_keys:
                log.debug(f"[SharedDataCache] Cleaned up {len(expired_keys)} expired entries. Remaining: {len(self._shared_cache)}")

            self._last_auto_cleanup = now
            return len(expired_keys)

    def _maybe_auto_cleanup(self):
        """Perform opportunistic cleanup if cleanup_interval has elapsed (internal, lock held)."""
        if time.time() - self._last_auto_cleanup > self._cleanup_interval:
            self.cleanup_expired()

    def clear(self):
        """Clear all entries in the cache."""
        with self._lock:
            self._shared_cache.clear()
            self.tmdb_genres_cache.clear()

    def size(self) -> int:
        """Return total active entries in cache."""
        with self._lock:
            return len(self._shared_cache)

    def stats(self) -> dict:
        """Return cache health statistics."""
        with self._lock:
            return {
                "entries": len(self._shared_cache),
                "max_size": self.max_size,
                "default_ttl": self.default_ttl,
                "tmdb_genre_sets": len(self.tmdb_genres_cache)
            }


class BoundedGuildSettingsCache(OrderedDict[int, GuildSettings]):
    """
    Thread-safe, bounded LRU cache for Discord GuildSettings.
    Protected by reentrant lock (threading.RLock) against concurrent multi-thread mutation.
    Prevents unbounded memory consumption in massive bot deployments (10k+ servers)
    while preserving standard dictionary semantics and fast O(1) lookups.
    """

    def __init__(self, max_size: int = DEFAULT_GUILD_CACHE_MAX_SIZE):
        super().__init__()
        self.max_size = max_size
        self._lock = threading.RLock()

    def __getitem__(self, key: int) -> GuildSettings:
        with self._lock:
            val = super().__getitem__(key)
            self.move_to_end(key)  # Mark as recently used
            return val

    def get(self, key: int, default: Any = None) -> Any:
        with self._lock:
            if key in self:
                return self[key]
            return default

    def __setitem__(self, key: int, value: GuildSettings):
        with self._lock:
            if key in self:
                self.move_to_end(key)
            super().__setitem__(key, value)
            if len(self) > self.max_size:
                # Evict least-recently-used item
                oldest_key, _ = self.popitem(last=False)
                log.debug(f"[GuildSettingsCache] Evicted LRU guild {oldest_key} (capacity: {self.max_size})")

    def __delitem__(self, key: int):
        with self._lock:
            super().__delitem__(key)

    def __contains__(self, key: object) -> bool:
        with self._lock:
            return super().__contains__(key)

    def __len__(self) -> int:
        with self._lock:
            return super().__len__()

    def pop(self, key: int, *args) -> Any:
        with self._lock:
            return super().pop(key, *args)

    def popitem(self, last: bool = True) -> tuple[int, GuildSettings]:
        with self._lock:
            return super().popitem(last=last)

    def clear(self):
        with self._lock:
            super().clear()

    def stats(self) -> dict:
        with self._lock:
            return {
                "size": len(self),
                "max_size": self.max_size,
            }

__all__ = [
    "SharedDataCache",
    "BoundedGuildSettingsCache",
]
