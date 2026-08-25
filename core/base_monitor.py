import time
from abc import ABC, abstractmethod
from logger import log
from db import monitor_repo
from models import BroadcastPayload
from services import (
    BaseDeliveryAdapter,
    DiscordDeliveryAdapter,
    is_channel_dead,
    mark_channel_dead,
    get_dead_channel_count,
    _DEAD_CHANNELS
)

class BaseMonitor(ABC):
    def __init__(self, bot, config, delivery_adapter: BaseDeliveryAdapter | None = None):
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
        
        if delivery_adapter is not None:
            self.delivery_adapter = delivery_adapter
        elif bot and isinstance(getattr(bot, "delivery_adapter", None), BaseDeliveryAdapter):
            self.delivery_adapter = bot.delivery_adapter
        else:
            self.delivery_adapter = DiscordDeliveryAdapter(bot)

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

    @abstractmethod
    async def fetch_new_items(self) -> list:
        """Fetch newly discovered items or events from the external source."""
        pass

    @abstractmethod
    def get_item_id(self, item) -> str:
        """Return a unique string ID for a given feed item to use for deduplication."""
        pass

    @abstractmethod
    async def process_item(self, item):
        """Build layout/embed and dispatch the notification to Discord channel(s)."""
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
            item_id = self.get_item_id(item)
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

    async def send_update(self, content=None, embed=None, view=None) -> bool:
        """Send an update via the configured delivery adapter."""
        payload = BroadcastPayload(
            content=content,
            embed=embed,
            view=view,
            guild_id=self.guild_id
        )
        return await self.delivery_adapter.deliver(
            payload=payload,
            target_channels=self.target_channels,
            guild_id=self.guild_id,
            platform=self.platform,
            monitor_id=self.id,
            monitor_name=self.name
        )
