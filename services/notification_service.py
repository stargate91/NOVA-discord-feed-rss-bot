from logger import log
from models import BroadcastPayload, FeedItem
from services.delivery_adapter import BaseDeliveryAdapter
from services.discord_delivery_adapter import DiscordDeliveryAdapter

class NotificationService:
    """
    Central notification dispatcher service.
    Coordinates delivering notifications across registered adapters (Discord, Webhook, etc.).
    """

    def __init__(self, bot=None, default_adapter: BaseDeliveryAdapter | None = None):
        self.bot = bot
        self._adapters: dict[str, BaseDeliveryAdapter] = {}

        # Set up default Discord adapter
        discord_adapter = default_adapter or DiscordDeliveryAdapter(bot)
        self.register_adapter("discord", discord_adapter)
        self._default_adapter_name = "discord"

    def register_adapter(self, name: str, adapter: BaseDeliveryAdapter):
        """Register a new delivery adapter under a named key."""
        self._adapters[name.lower()] = adapter
        log.debug(f"[NotificationService] Registered delivery adapter: '{name}'")

    def get_adapter(self, name: str | None = None) -> BaseDeliveryAdapter | None:
        """Retrieve an adapter by name, falling back to default adapter."""
        target = (name or self._default_adapter_name).lower()
        return self._adapters.get(target)

    async def dispatch(
        self,
        payload: BroadcastPayload,
        target_channels: list[int | str],
        guild_id: int = 0,
        platform: str = "unknown",
        monitor_id: int | None = None,
        monitor_name: str = "",
        adapter_name: str = "discord"
    ) -> bool:
        """Dispatch a broadcast payload to the designated adapter."""
        adapter = self.get_adapter(adapter_name)
        if not adapter:
            log.error(f"[NotificationService] No adapter found for name '{adapter_name}'")
            return False

        return await adapter.deliver(
            payload=payload,
            target_channels=target_channels,
            guild_id=guild_id,
            platform=platform,
            monitor_id=monitor_id,
            monitor_name=monitor_name
        )

    async def broadcast_item(
        self,
        item: FeedItem,
        target_channels: list[int | str],
        guild_id: int = 0,
        platform: str = "unknown",
        monitor_id: int | None = None,
        monitor_name: str = "",
        adapter_name: str = "discord"
    ) -> bool:
        """Convert a FeedItem into a basic BroadcastPayload and deliver it."""
        payload = BroadcastPayload(
            content=f"**{item.title}**\n{item.url or ''}".strip(),
            title=item.title,
            url=item.url,
            guild_id=guild_id
        )
        return await self.dispatch(
            payload=payload,
            target_channels=target_channels,
            guild_id=guild_id,
            platform=platform,
            monitor_id=monitor_id,
            monitor_name=monitor_name,
            adapter_name=adapter_name
        )
