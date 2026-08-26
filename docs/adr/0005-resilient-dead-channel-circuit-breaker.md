# ADR-0005: In-Memory Dead Channel Circuit Breaker for Rate-Limit Isolation

- **Status:** Accepted
- **Date:** 2026-08-26
- **Deciders:** Nova Core Architecture Team

---

## Context & Problem Statement

In multi-tenant Discord bots, server administrators frequently delete, rename, or restrict permissions on Discord channels configured as notification destinations without updating the bot's configuration.

When new feed items arrive for broadcast:
1. The bot attempts to send messages to deleted or forbidden channels (`discord.NotFound` 404 / `discord.Forbidden` 403).
2. Repeated failed API requests consume Discord API rate-limit buckets (Global Rate Limit: 50 requests/sec).
3. Legitimate messages to active channels become delayed or throttled by Discord rate limits.

---

## Decision Outcome

**Chosen Solution: In-Memory Bounded TTL Circuit Breaker (`_DEAD_CHANNELS`).**

Implemented in [services/discord_delivery_adapter.py](file:///e:/projects/repos/bots/nova/services/discord_delivery_adapter.py):

1. **Dead Channel Blacklist:**
   - When a dispatch raises `discord.NotFound` (channel deleted) or `discord.Forbidden` (bot kicked/permissions revoked), the channel ID is marked dead via `mark_channel_dead(channel_id, ttl=3600.0)`.
2. **Fast-Bail Check:**
   - Before attempting any Discord API network dispatch, `is_channel_dead(channel_id)` performs an instantaneous O(1) in-memory check. If marked dead, dispatch is bypassed immediately without consuming Discord API rate limits.
3. **Auto-Eviction & Bounded Capacity:**
   - Entries expire automatically after `DEFAULT_DEAD_CHANNEL_TTL_SECONDS` (1 hour) to allow recovery if channel permissions are restored.
   - A maximum capacity of `MAX_DEAD_CHANNELS_CAPACITY` (5000) prevents memory leaks.

---

## Pros and Cons

### Pros
- **Rate-Limit Immunity:** Zero wasted Discord API requests to non-existent or inaccessible channels.
- **Self-Healing:** Automatic TTL expiration re-probes channels after 1 hour if an admin re-grants permissions.
- **Deterministic Memory:** Strictly bounded capacity ensures no memory leakage.
