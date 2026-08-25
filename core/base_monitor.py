import time
from abc import ABC, abstractmethod
import discord
from logger import log
from db import monitor_repo

# In-memory blacklist for deleted/inaccessible Discord channels
_DEAD_CHANNELS: dict[int, float] = {}
DEAD_CHANNEL_TTL: float = 3600.0  # 1 hour

def is_channel_dead(channel_id: int) -> bool:
    """Check if a channel ID is marked as deleted/dead within TTL."""
    if not channel_id:
        return True
    exp = _DEAD_CHANNELS.get(channel_id)
    if exp is None:
        return False
    if time.time() < exp:
        return True
    # Expired from blacklist
    del _DEAD_CHANNELS[channel_id]
    return False

def mark_channel_dead(channel_id: int, ttl: float = DEAD_CHANNEL_TTL):
    """Mark a channel ID as dead for a specific TTL duration."""
    if channel_id:
        _DEAD_CHANNELS[channel_id] = time.time() + ttl

def get_dead_channel_count() -> int:
    """Return count of active dead channels."""
    now = time.time()
    return sum(1 for exp in _DEAD_CHANNELS.values() if now < exp)

class BaseMonitor(ABC):
    def __init__(self, bot, config):
        self.bot = bot
        self.config = config
        self.id = config.get("id")
        self.name = config.get("name", "Unknown Monitor")
        self.embed_color = config.get("embed_color", "3d3f45")
        self.platform = config.get("type", "unknown")
        self.enabled = config.get("enabled", True)
        self.is_first_run = True # Used for centralized silent seeding in MonitorManager
        self.target_channels = config.get("target_channels", [])
        self.target_roles = config.get("target_roles", [])
        self.guild_id = config.get("guild_id", 0)
        self.send_initial_alert = config.get("send_initial_alert", False)

    @property
    def ping_role(self):
        """Return the formatted ping string if a role is configured."""
        pings = []
        for role_id in self.target_roles:
            if role_id and role_id != 0:
                pings.append(f"<@&{role_id}>")
        return " ".join(pings) if pings else ""

    def get_alert_message(self, variables=None):
        """Get the alert template for this monitor's guild/platform and format it."""
        try:
            template = self.bot.get_alert_template(self.guild_id, self.platform)
            if not template:
                return self.ping_role
            
            # Extract variables safely
            v = variables or {}
            
            # Map standard fields
            title = v.get("title", "")
            url = v.get("url", "")
            author = v.get("author") or v.get("name") or self.name
            role = self.ping_role
            
            # Global clean replacers
            res = template.replace("{role}", role)
            res = res.replace("{author}", author)
            res = res.replace("{name}", author)
            res = res.replace("{title}", title)
            res = res.replace("{url}", url)
            
            # Custom tags
            for key, val in v.items():
                res = res.replace(f"{{{key}}}", str(val))
                
            return res.strip()
        except Exception as e:
            log.error(f"Error parsing alert template: {e}")
            return self.ping_role

    def get_shared_key(self):
        """
        Return a unique string identifying the underlying external resource (e.g. RSS URL, YT channel ID).
        Monitors sharing the same key will be polled together. Return None if polling cannot be shared.
        """
        return None

    def get_color(self, default_hex=0x3d3f45):
        """Get the embed color configured for this monitor, or fallback to default."""
        c = self.embed_color
        if not c:
            extra = self.config.get("extra_settings", {})
            if isinstance(extra, dict):
                c = extra.get("embed_color")

        if c:
            try:
                if isinstance(c, str):
                    c = c.replace("#", "").replace("0x", "")
                    return int(c, 16)
                return int(c)
            except (ValueError, TypeError):
                pass
        return default_hex
        
    def get_image_url(self, default_url=None):
        """Get the image URL, prioritizing the custom image if configured."""
        custom = self.config.get("custom_image")
        if not custom:
            extra = self.config.get("extra_settings", {})
            if isinstance(extra, dict):
                custom = extra.get("custom_image")
        
        return custom if custom else default_url

    async def check_for_updates(self):
        """Perform the check for updates. Deprecated in favor of fetch_new_items."""
        pass
    
    @abstractmethod
    async def get_latest_item(self):
        """Fetch the most recent item and return its (content, embed, view) without posting or marking as published."""
        pass

    async def get_latest_items(self, count=1):
        """Fetch the N most recent items and return as a list of data dicts. Default calls get_latest_item."""
        if count <= 1:
            item = await self.get_latest_item()
            return [item] if item else []
        return [] # Subclasses should override for N > 1

    async def mark_items_published(self, items: list):
        """Default bulk implementation to mark items published in DB."""
        if not items:
            return
        records = []
        for item in items:
            item_id = self.get_item_id(item) if hasattr(self, "get_item_id") else None
            if item_id:
                title = item.get("title") if isinstance(item, dict) else str(item_id)
                thumb = item.get("thumbnail") or item.get("thumbnail_url") if isinstance(item, dict) else None
                records.append({
                    "entry_id": str(item_id),
                    "platform": self.platform,
                    "guild_id": self.guild_id,
                    "feed_url": getattr(self, "feed_url", None) or getattr(self, "api_url", None),
                    "title": title,
                    "thumbnail_url": self.get_image_url(thumb),
                    "author_name": self.name
                })
        if records:
            await monitor_repo.mark_as_published_bulk(records)

    async def get_preview(self):
        """
        Return a list of data dicts (content, embed, view) to represent how an alert looks.
        Default implementation returns the latest real item.
        """
        item = await self.get_latest_item()
        if not item or item.get("empty"):
            return None
        return [item]

    async def send_update(self, content=None, embed=None, view=None):
        """Send an update to the configured Discord channel(s) with dead-channel protection."""
        if not self.target_channels:
            log.warning(f"No target channels configured for monitor: {self.name}")
            return

        for ch_id in self.target_channels:
            if not ch_id:
                continue

            # Skip known dead/deleted channels to avoid Discord API 404/403 spam
            if is_channel_dead(ch_id):
                log.debug(f"[BaseMonitor] Skipping dead/blacklisted channel {ch_id} for {self.name}")
                continue

            channel = self.bot.get_channel(ch_id)
            if not channel:
                try:
                    channel = await self.bot.fetch_channel(ch_id)
                except discord.NotFound as enf:
                    if enf.code == 10003: # Unknown Channel (deleted)
                        log.warning(f"Channel {ch_id} for {self.name} is DELETED (10003). Blacklisting for 1h.")
                        mark_channel_dead(ch_id)
                        continue
                    log.error(f"Could not fetch channel {ch_id} for {self.name}: {enf}")
                    continue
                except discord.Forbidden:
                    log.warning(f"Missing permissions (403 Forbidden) for channel {ch_id} on {self.name}. Blacklisting for 1h.")
                    mark_channel_dead(ch_id)
                    continue
                except Exception as e:
                    log.error(f"Could not fetch channel {ch_id} for {self.name}: {e}")
                    continue

            if channel:
                try:
                    if content is None and embed is None and view is None:
                        continue # Skip empty updates to prevent 50006 errors
                        
                    # Logic to handle Discord Components V2 (LayoutView)
                    # V2 messages (IS_COMPONENTS_V2 flag) cannot have the 'content' field.
                    # If we have both content and a V2 view, we send them as two separate messages.
                    is_v2 = view and (hasattr(view, "_is_v2") or type(view).__name__ == "LayoutView")
                    
                    if is_v2 and content:
                        # Message 1: Alert Text (and URL)
                        # We suppress embeds so Discord doesn't generate a native embed if a URL is present
                        await channel.send(content=content, suppress_embeds=True)
                        # Message 2: The V2 Layout
                        await channel.send(view=view)
                    else:
                        await channel.send(content=content, embed=embed, view=view)
                        
                    log.info(f"Published update for {self.name} on channel {channel.name}", extra={'guild_id': self.guild_id})
                    await monitor_repo.increment_post_stat(self.guild_id, self.platform)
                    await monitor_repo.update_last_post_at(self.id)
                except discord.NotFound:
                    log.warning(f"Channel {ch_id} was deleted during send for {self.name}. Blacklisting.")
                    mark_channel_dead(ch_id)
                except discord.Forbidden:
                    log.warning(f"Missing send permissions in channel {ch_id} for {self.name}. Blacklisting.")
                    mark_channel_dead(ch_id)
                except Exception as e:
                    log.error(f"Failed to send update to channel {ch_id} for {self.name}: {e}", extra={'guild_id': self.guild_id})
            else:
                log.warning(f"Could not find channel {ch_id} for {self.name}", extra={'guild_id': self.guild_id})
