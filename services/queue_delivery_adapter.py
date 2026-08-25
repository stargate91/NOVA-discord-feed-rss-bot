from logger import log
from models import BroadcastPayload
from services.delivery_adapter import BaseDeliveryAdapter
from services.queue_service import BaseNotificationQueue, notification_queue

class QueueDeliveryAdapter(BaseDeliveryAdapter):
    """
    Delivery adapter that places notification payloads onto an asynchronous worker queue.
    Allows feed ingestion pipelines to run without needing any Discord credentials or connections.
    """

    def __init__(self, queue: BaseNotificationQueue | None = None, queue_name: str = "discord_notifications"):
        self.queue = queue or notification_queue
        self.queue_name = queue_name

    async def deliver(
        self,
        payload: BroadcastPayload,
        target_channels: list[int | str],
        guild_id: int = 0,
        platform: str = "unknown",
        monitor_id: int | None = None,
        monitor_name: str = "Unknown Monitor"
    ) -> bool:
        """Enqueue broadcast payload task for gateway workers to deliver."""
        if not target_channels:
            log.warning(f"[QueueDeliveryAdapter] No target channels configured for monitor: {monitor_name}")
            return False

        task_data = {
            "content": payload.content,
            "title": payload.title,
            "url": payload.url,
            "guild_id": guild_id,
            "platform": platform,
            "monitor_id": monitor_id,
            "monitor_name": monitor_name,
            "target_channels": target_channels,
            "extra_data": getattr(payload, "extra_data", {}) or {}
        }

        success = await self.queue.push(task_data, self.queue_name)
        if success:
            log.info(
                f"[QueueDeliveryAdapter] Enqueued notification for {monitor_name} to {len(target_channels)} channels",
                extra={
                    "guild_id": guild_id,
                    "platform": platform,
                    "monitor_id": monitor_id,
                    "event": "notification_enqueued"
                }
            )
        return success
