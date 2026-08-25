import asyncio
from logger import log
from models import BroadcastPayload
from services.delivery_adapter import BaseDeliveryAdapter
from services.queue_service import BaseNotificationQueue, notification_queue

class QueueConsumerWorker:
    """
    Background worker that continuously pulls tasks from the notification queue
    and delivers them to Discord channels via a DiscordDeliveryAdapter.
    """

    def __init__(
        self,
        delivery_adapter: BaseDeliveryAdapter,
        queue: BaseNotificationQueue | None = None,
        queue_name: str = "discord_notifications"
    ):
        self.delivery_adapter = delivery_adapter
        self.queue = queue or notification_queue
        self.queue_name = queue_name
        self._running = False
        self._task: asyncio.Task | None = None

    async def process_one(self, timeout: float = 1.0) -> bool:
        """Fetch and process a single task from the queue. Returns True if a task was processed."""
        task_data = await self.queue.pop(self.queue_name, timeout=timeout)
        if not task_data:
            return False

        try:
            payload = BroadcastPayload(
                content=task_data.get("content"),
                title=task_data.get("title"),
                url=task_data.get("url"),
                guild_id=task_data.get("guild_id", 0),
                extra_data=task_data.get("extra_data", {})
            )
            target_channels = task_data.get("target_channels", [])
            guild_id = task_data.get("guild_id", 0)
            platform = task_data.get("platform", "unknown")
            monitor_id = task_data.get("monitor_id")
            monitor_name = task_data.get("monitor_name", "Unknown Monitor")

            return await self.delivery_adapter.deliver(
                payload=payload,
                target_channels=target_channels,
                guild_id=guild_id,
                platform=platform,
                monitor_id=monitor_id,
                monitor_name=monitor_name
            )
        except Exception as e:
            log.error(f"[QueueConsumerWorker] Error processing notification task: {e}", exc_info=True)
            return False

    async def run(self, poll_interval: float = 0.5):
        """Run continuous worker loop until stopped."""
        self._running = True
        log.info(f"[QueueConsumerWorker] Started consuming from queue '{self.queue_name}'")

        while self._running:
            try:
                processed = await self.process_one(timeout=1.0)
                if not processed:
                    await asyncio.sleep(poll_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                log.error(f"[QueueConsumerWorker] Unexpected error in worker loop: {e}")
                await asyncio.sleep(1.0)

        log.info("[QueueConsumerWorker] Worker loop terminated.")

    def start(self):
        """Start worker in a background asyncio task."""
        if not self._running:
            self._task = asyncio.create_task(self.run())

    def stop(self):
        """Signal worker to terminate gracefully."""
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
