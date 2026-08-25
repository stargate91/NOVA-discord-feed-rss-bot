import unittest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from models import BroadcastPayload
from services import (
    BaseNotificationQueue,
    MemoryNotificationQueue,
    get_notification_queue,
    QueueDeliveryAdapter,
    QueueConsumerWorker,
    DiscordDeliveryAdapter
)

class TestWorkerQueueAndMicroservices(unittest.IsolatedAsyncioTestCase):
    async def test_memory_notification_queue_operations(self):
        """Verify MemoryNotificationQueue push, pop, qsize, and timeout."""
        queue = MemoryNotificationQueue()
        self.assertEqual(await queue.qsize("test_q"), 0)

        # Push items
        await queue.push({"id": 1, "task": "alert_1"}, queue_name="test_q")
        await queue.push({"id": 2, "task": "alert_2"}, queue_name="test_q")
        self.assertEqual(await queue.qsize("test_q"), 2)

        # Pop item 1
        item1 = await queue.pop("test_q", timeout=0.1)
        self.assertIsNotNone(item1)
        self.assertEqual(item1["id"], 1)

        # Pop item 2
        item2 = await queue.pop("test_q", timeout=0.1)
        self.assertIsNotNone(item2)
        self.assertEqual(item2["id"], 2)

        # Queue is now empty, pop should return None on timeout
        empty = await queue.pop("test_q", timeout=0.05)
        self.assertIsNone(empty)

    async def test_queue_delivery_adapter_pushes_task(self):
        """Verify QueueDeliveryAdapter serializes BroadcastPayload and enqueues it."""
        queue = MemoryNotificationQueue()
        adapter = QueueDeliveryAdapter(queue=queue, queue_name="discord_notifications")

        payload = BroadcastPayload(
            content="🚀 New Release: Nova v2.0",
            title="Nova v2.0",
            url="https://github.com/nova/bot/releases/v2.0",
            guild_id=1234
        )

        success = await adapter.deliver(
            payload=payload,
            target_channels=[555, 666],
            guild_id=1234,
            platform="github",
            monitor_id=99,
            monitor_name="Nova Releases"
        )

        self.assertTrue(success)
        self.assertEqual(await queue.qsize("discord_notifications"), 1)

        task = await queue.pop("discord_notifications", timeout=0.1)
        self.assertIsNotNone(task)
        self.assertEqual(task["content"], "🚀 New Release: Nova v2.0")
        self.assertEqual(task["target_channels"], [555, 666])
        self.assertEqual(task["platform"], "github")
        self.assertEqual(task["monitor_id"], 99)

    async def test_queue_consumer_worker_delivery_flow(self):
        """Verify QueueConsumerWorker pops from queue and dispatches through destination adapter."""
        queue = MemoryNotificationQueue()
        mock_discord_adapter = MagicMock()
        mock_discord_adapter.deliver = AsyncMock(return_value=True)

        consumer = QueueConsumerWorker(
            delivery_adapter=mock_discord_adapter,
            queue=queue,
            queue_name="feed_tasks"
        )

        # 1. When queue is empty, process_one returns False
        processed = await consumer.process_one(timeout=0.05)
        self.assertFalse(processed)
        mock_discord_adapter.deliver.assert_not_called()

        # 2. Push task and process
        await queue.push({
            "content": "Live stream started!",
            "title": "Stream Title",
            "url": "https://twitch.tv/streamer",
            "guild_id": 444,
            "platform": "twitch",
            "monitor_id": 12,
            "monitor_name": "Twitch Stream",
            "target_channels": [8888]
        }, queue_name="feed_tasks")

        processed_success = await consumer.process_one(timeout=0.1)
        self.assertTrue(processed_success)
        mock_discord_adapter.deliver.assert_called_once()
        call_kwargs = mock_discord_adapter.deliver.call_args[1]
        self.assertEqual(call_kwargs["target_channels"], [8888])
        self.assertEqual(call_kwargs["guild_id"], 444)
        self.assertEqual(call_kwargs["platform"], "twitch")

    async def test_end_to_end_decoupled_worker_and_gateway_flow(self):
        """
        Full End-to-End Microservice Flow:
        Feed Worker -> QueueDeliveryAdapter -> Notification Queue -> QueueConsumerWorker -> Discord Channel
        """
        shared_queue = MemoryNotificationQueue()

        # --- Side A: Feed Worker ---
        producer_adapter = QueueDeliveryAdapter(queue=shared_queue, queue_name="e2e_queue")
        feed_payload = BroadcastPayload(
            content="YouTube: New Video Uploaded!",
            title="Video 1",
            guild_id=999
        )
        await producer_adapter.deliver(
            payload=feed_payload,
            target_channels=[1010],
            guild_id=999,
            platform="youtube",
            monitor_name="YT Monitor"
        )

        self.assertEqual(await shared_queue.qsize("e2e_queue"), 1)

        # --- Side B: Gateway Bot Consumer ---
        mock_bot = MagicMock()
        mock_channel = MagicMock()
        mock_channel.send = AsyncMock()
        mock_bot.get_channel.return_value = mock_channel

        gateway_adapter = DiscordDeliveryAdapter(mock_bot)
        consumer = QueueConsumerWorker(delivery_adapter=gateway_adapter, queue=shared_queue, queue_name="e2e_queue")

        from unittest.mock import patch
        with patch("db.monitor_repo.increment_post_stat", new_callable=AsyncMock), \
             patch("db.monitor_repo.update_last_post_at", new_callable=AsyncMock):
            # Process task
            delivered = await consumer.process_one(timeout=0.1)
            self.assertTrue(delivered)
            self.assertEqual(await shared_queue.qsize("e2e_queue"), 0)
            mock_channel.send.assert_called_once_with(
                content="YouTube: New Video Uploaded!",
                embed=None,
                view=None
            )

    def test_queue_factory(self):
        """Verify get_notification_queue returns Memory or Redis queue based on URL."""
        mem_q = get_notification_queue(None)
        self.assertIsInstance(mem_q, MemoryNotificationQueue)

        redis_q = get_notification_queue("redis://localhost:6379/0")
        self.assertEqual(redis_q.redis_url, "redis://localhost:6379/0")

if __name__ == "__main__":
    unittest.main()
