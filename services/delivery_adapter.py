from abc import ABC, abstractmethod
from models import BroadcastPayload

class BaseDeliveryAdapter(ABC):
    """
    Abstract interface for notification delivery adapters.
    Allows decoupling notification generation from delivery channels (Discord, Webhooks, Telegram, etc.).
    """

    @abstractmethod
    async def deliver(
        self,
        payload: BroadcastPayload,
        target_channels: list[int | str],
        guild_id: int = 0,
        platform: str = "unknown",
        monitor_id: int | None = None,
        monitor_name: str = ""
    ) -> bool:
        """
        Deliver a rendered broadcast payload to the specified destination channels.
        Returns True if at least one delivery succeeded.
        """
        pass
