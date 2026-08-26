import time
import discord
from logger import log
from db import monitor_repo
from models import BroadcastPayload
from services.delivery_adapter import BaseDeliveryAdapter
from core.constants import (
    DEFAULT_DEAD_CHANNEL_TTL_SECONDS,
    MAX_DEAD_CHANNELS_CAPACITY,
)

# In-memory blacklist for deleted/inaccessible Discord channels
_DEAD_CHANNELS: dict[int, float] = {}
DEAD_CHANNEL_TTL: float = float(DEFAULT_DEAD_CHANNEL_TTL_SECONDS)  # 1 hour
MAX_DEAD_CHANNELS: int = MAX_DEAD_CHANNELS_CAPACITY                # Maximum blacklist capacity

def cleanup_dead_channels() -> int:
    """Evict all expired channels from the dead channel blacklist."""
    now = time.time()
    expired = [ch_id for ch_id, exp in _DEAD_CHANNELS.items() if now >= exp]
    for ch_id in expired:
        _DEAD_CHANNELS.pop(ch_id, None)
    return len(expired)

def is_channel_dead(channel_id: int) -> bool:
    """Check if a channel ID is marked as deleted/dead within TTL."""
    if not channel_id:
        return True
    exp = _DEAD_CHANNELS.get(channel_id)
    if exp is None:
        return False
    if time.time() < exp:
        return True
    # Expired from blacklist - evict immediately
    _DEAD_CHANNELS.pop(channel_id, None)
    return False

def mark_channel_dead(channel_id: int, ttl: float = DEAD_CHANNEL_TTL):
    """Mark a channel ID as dead for a specific TTL duration, enforcing bounded capacity."""
    if not channel_id:
        return

    # Enforce max capacity
    if len(_DEAD_CHANNELS) >= MAX_DEAD_CHANNELS and channel_id not in _DEAD_CHANNELS:
        cleanup_dead_channels()
        if len(_DEAD_CHANNELS) >= MAX_DEAD_CHANNELS:
            # Still full: evict earliest 10% expiring entries
            sorted_by_exp = sorted(_DEAD_CHANNELS.items(), key=lambda item: item[1])
            evict_count = max(1, len(sorted_by_exp) // 10)
            for ch, _ in sorted_by_exp[:evict_count]:
                _DEAD_CHANNELS.pop(ch, None)

    _DEAD_CHANNELS[channel_id] = time.time() + ttl

def get_dead_channel_count() -> int:
    """Return count of active dead channels."""
    now = time.time()
    return sum(1 for exp in _DEAD_CHANNELS.values() if now < exp)

class DiscordDeliveryAdapter(BaseDeliveryAdapter):
    """Delivery adapter responsible for dispatching messages and layouts to Discord channels."""

    def __init__(self, bot=None):
        self.bot = bot

    async def deliver(
        self,
        payload: BroadcastPayload,
        target_channels: list[int | str],
        guild_id: int = 0,
        platform: str = "unknown",
        monitor_id: int | None = None,
        monitor_name: str = "Unknown Monitor"
    ) -> bool:
        """Deliver a broadcast payload to target Discord channels with rate-limit and error isolation."""
        if not target_channels:
            log.warning(f"No target channels configured for monitor: {monitor_name}")
            return False

        if not self.bot:
            log.warning(f"[DiscordDeliveryAdapter] No bot instance provided to deliver to {monitor_name}")
            return False

        delivered_any = False

        for raw_ch_id in target_channels:
            if not raw_ch_id:
                continue

            try:
                ch_id = int(raw_ch_id)
            except (ValueError, TypeError):
                continue

            # Skip known dead/deleted channels to avoid Discord API 404/403 spam
            if is_channel_dead(ch_id):
                log.debug(f"[DiscordDeliveryAdapter] Skipping dead/blacklisted channel {ch_id} for {monitor_name}")
                continue

            channel = self.bot.get_channel(ch_id) if hasattr(self.bot, "get_channel") else None
            if not channel and hasattr(self.bot, "fetch_channel"):
                try:
                    channel = await self.bot.fetch_channel(ch_id)
                except discord.NotFound as enf:
                    if getattr(enf, "code", None) == 10003:  # Unknown Channel (deleted)
                        log.warning(f"Channel {ch_id} for {monitor_name} is DELETED (10003). Blacklisting for 1h.")
                        mark_channel_dead(ch_id)
                        continue
                    log.error(f"Could not fetch channel {ch_id} for {monitor_name}: {enf}")
                    continue
                except discord.Forbidden:
                    log.warning(f"Missing permissions (403 Forbidden) for channel {ch_id} on {monitor_name}. Blacklisting for 1h.")
                    mark_channel_dead(ch_id)
                    continue
                except Exception as e:
                    log.error(f"Could not fetch channel {ch_id} for {monitor_name}: {e}")
                    continue

            if channel:
                t0 = time.perf_counter()
                try:
                    content = payload.content
                    embed = payload.embed
                    view = payload.view

                    if content is None and embed is None and view is None:
                        continue  # Skip empty updates to prevent 50006 errors

                    # Logic to handle Discord Components V2 (LayoutView)
                    # V2 messages cannot have the 'content' field.
                    # If we have both content and a V2 view, we send them as two separate messages.
                    is_v2 = view and (hasattr(view, "_is_v2") or type(view).__name__ == "LayoutView")

                    if is_v2 and content:
                        # Message 1: Alert Text (and URL) with suppressed native embeds
                        await channel.send(content=content, suppress_embeds=True)
                        # Message 2: The V2 Layout
                        await channel.send(view=view)
                    else:
                        await channel.send(content=content, embed=embed, view=view)

                    duration_sec = time.perf_counter() - t0
                    latency_ms = round(duration_sec * 1000.0, 1)
                    channel_name = getattr(channel, "name", str(ch_id))

                    log.info(
                        f"Published update for {monitor_name} on channel {channel_name}",
                        extra={
                            'guild_id': guild_id,
                            'platform': platform,
                            'monitor_id': monitor_id,
                            'channel_id': ch_id,
                            'latency_ms': latency_ms,
                            'event': 'notification_delivered'
                        }
                    )

                    await monitor_repo.increment_post_stat(guild_id, platform)
                    if monitor_id is not None:
                        await monitor_repo.update_last_post_at(monitor_id)

                    from services.metrics_service import metrics
                    metrics.record_notification_delivered(platform, success=True, duration_seconds=duration_sec)

                    delivered_any = True
                except discord.NotFound:
                    log.warning(f"Channel {ch_id} was deleted during send for {monitor_name}. Blacklisting.")
                    mark_channel_dead(ch_id)
                    from services.metrics_service import metrics
                    metrics.record_notification_delivered(platform, success=False)
                except discord.Forbidden:
                    log.warning(f"Missing send permissions in channel {ch_id} for {monitor_name}. Blacklisting.")
                    mark_channel_dead(ch_id)
                    from services.metrics_service import metrics
                    metrics.record_notification_delivered(platform, success=False)
                except Exception as e:
                    log.error(f"Failed to send update to channel {ch_id} for {monitor_name}: {e}", extra={'guild_id': guild_id, 'platform': platform})
                    from services.metrics_service import metrics
                    metrics.record_notification_delivered(platform, success=False)
            else:
                log.warning(f"Could not find channel {ch_id} for {monitor_name}", extra={'guild_id': guild_id, 'platform': platform})

        return delivered_any
