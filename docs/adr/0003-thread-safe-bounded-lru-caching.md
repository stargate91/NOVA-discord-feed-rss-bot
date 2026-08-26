# ADR-0003: Thread-Safe Bounded LRU & Shared Feed Caching Strategy

- **Status:** Accepted
- **Date:** 2026-08-26
- **Deciders:** Nova Core Architecture Team

---

## Context & Problem Statement

As the bot scales to thousands of Discord servers, caching guild settings and feed responses is crucial to avoid saturating PostgreSQL and external upstream APIs (e.g. YouTube Data API quotas, Steam News RSS limits).

However, naive in-memory dictionaries (`dict`) pose two severe risks:
1. **Unbounded Memory Leak:** In a 50,000+ server deployment, an unbounded cache causes constant OOM crashes.
2. **Race Conditions & Concurrency Hazards:** In a multi-threaded or concurrent async environment, simultaneous mutations on non-synchronized dictionaries cause `RuntimeError: dictionary changed size during iteration` or corrupted pointers.

---

## Decision Outcome

**Chosen Solution: Bounded Thread-Safe LRU Caches with `threading.RLock`.**

1. **`BoundedGuildSettingsCache` ([engine/cache.py](file:///e:/projects/repos/bots/nova/engine/cache.py)):**
   - Subclasses `OrderedDict` with a strict `max_size` (default: `DEFAULT_GUILD_CACHE_MAX_SIZE = 5000`).
   - Accessing a key moves it to the end (`move_to_end`).
   - Exceeding `max_size` automatically evicts the least recently used item (`popitem(last=False)`).
   - Every read and write operation is protected by a reentrant lock (`threading.RLock`).

2. **`SharedDataCache` ([engine/cache.py](file:///e:/projects/repos/bots/nova/engine/cache.py)):**
   - Implements per-item TTL expiration and background garbage collection.
   - Prevents multiple guilds monitoring the same feed (e.g. 500 servers tracking `IGN YouTube Channel`) from making 500 separate HTTP requests.
   - Enforces `DEFAULT_SHARED_CACHE_MAX_SIZE` (2000 items) and `DEFAULT_SHARED_CACHE_TTL_SECONDS` (120 seconds).

---

## Pros and Cons

### Pros
- **Deterministic Memory Upper Bound:** Memory consumption is strictly capped regardless of total guild count.
- **Thread & Concurrency Safety:** Safe under Python multi-threading and free-threaded (Python 3.13+) execution.
- **Upstream API Quota Savings:** 90%+ reduction in external HTTP requests for popular shared feed channels.
