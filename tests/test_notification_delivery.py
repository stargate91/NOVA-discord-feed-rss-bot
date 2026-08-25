import unittest
from unittest.mock import MagicMock, AsyncMock, patch
import discord
from models import BroadcastPayload, FeedItem
from services import (
    BaseDeliveryAdapter,
    DiscordDeliveryAdapter,
    NotificationService,
    is_channel_dead,
    mark_channel_dead,
    _DEAD_CHANNELS
)
from core.base_monitor import BaseMonitor

class CustomMockAdapter(BaseDeliveryAdapter):
    def __init__(self):
        self.delivered_payloads = []

    async def deliver(
        self,
        payload: BroadcastPayload,
        target_channels: list[int | str],
        guild_id: int = 0,
        platform: str = "unknown",
        monitor_id: int | None = None,
        monitor_name: str = ""
    ) -> bool:
        self.delivered_payloads.append({
            "payload": payload,
            "channels": target_channels,
            "guild_id": guild_id,
            "platform": platform,
            "monitor_id": monitor_id,
            "monitor_name": monitor_name
        })
        return True

class DummyMonitorWithAdapter(BaseMonitor):
    def __init__(self, bot, config, adapter=None):
        super().__init__(bot, config, delivery_adapter=adapter)

    async def fetch_new_items(self) -> list:
        return []

    def get_item_id(self, item) -> str:
        return "1"

    async def process_item(self, item):
        pass

    async def get_latest_item(self):
        return None

class TestNotificationDelivery(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        _DEAD_CHANNELS.clear()
        self.bot = MagicMock()

    async def test_discord_delivery_adapter_success(self):
        """Verify DiscordDeliveryAdapter resolves channel, sends message, and updates stats."""
        adapter = DiscordDeliveryAdapter(self.bot)
        mock_channel = MagicMock()
        mock_channel.name = "general"
        mock_channel.send = AsyncMock()
        self.bot.get_channel.return_value = mock_channel

        payload = BroadcastPayload(content="Hello World", guild_id=123)

        with patch("db.monitor_repo.increment_post_stat", new_callable=AsyncMock) as mock_inc, \
             patch("db.monitor_repo.update_last_post_at", new_callable=AsyncMock) as mock_last_post:

            result = await adapter.deliver(
                payload=payload,
                target_channels=[555],
                guild_id=123,
                platform="youtube",
                monitor_id=99,
                monitor_name="Test YT"
            )

            self.assertTrue(result)
            mock_channel.send.assert_called_once_with(content="Hello World", embed=None, view=None)
            mock_inc.assert_called_once_with(123, "youtube")
            mock_last_post.assert_called_once_with(99)

    async def test_discord_delivery_adapter_dead_channel_handling(self):
        """Verify 403 Forbidden marks channel dead and skips future deliveries."""
        adapter = DiscordDeliveryAdapter(self.bot)
        self.bot.get_channel.return_value = None

        forbidden_err = discord.Forbidden(response=MagicMock(status=403), message="Forbidden")
        self.bot.fetch_channel = AsyncMock(side_effect=forbidden_err)

        payload = BroadcastPayload(content="Alert", guild_id=100)

        result = await adapter.deliver(
            payload=payload,
            target_channels=[111],
            guild_id=100,
            platform="rss",
            monitor_id=1
        )

        self.assertFalse(result)
        self.assertTrue(is_channel_dead(111))

        # Subsequent delivery should be skipped immediately without fetch_channel
        self.bot.fetch_channel.reset_mock()
        result2 = await adapter.deliver(
            payload=payload,
            target_channels=[111],
            guild_id=100,
            platform="rss"
        )
        self.assertFalse(result2)
        self.bot.fetch_channel.assert_not_called()

    async def test_notification_service_custom_adapter(self):
        """Verify NotificationService routes to custom registered delivery adapters."""
        custom = CustomMockAdapter()
        svc = NotificationService(self.bot)
        svc.register_adapter("custom", custom)

        payload = BroadcastPayload(content="Custom Alert", title="Special", guild_id=999)
        success = await svc.dispatch(
            payload=payload,
            target_channels=[123, 456],
            guild_id=999,
            platform="github",
            monitor_name="Nova Releases",
            adapter_name="custom"
        )

        self.assertTrue(success)
        self.assertEqual(len(custom.delivered_payloads), 1)
        record = custom.delivered_payloads[0]
        self.assertEqual(record["payload"].content, "Custom Alert")
        self.assertEqual(record["channels"], [123, 456])
        self.assertEqual(record["guild_id"], 999)
        self.assertEqual(record["platform"], "github")

    async def test_notification_service_broadcast_item(self):
        """Verify broadcast_item converts FeedItem to payload and sends."""
        custom = CustomMockAdapter()
        svc = NotificationService(self.bot)
        svc.register_adapter("custom", custom)

        item = FeedItem(id="item_1", title="Exciting News", url="https://example.com/news")
        success = await svc.broadcast_item(
            item=item,
            target_channels=[777],
            guild_id=111,
            platform="rss",
            adapter_name="custom"
        )

        self.assertTrue(success)
        self.assertEqual(len(custom.delivered_payloads), 1)
        self.assertIn("Exciting News", custom.delivered_payloads[0]["payload"].content)
        self.assertIn("https://example.com/news", custom.delivered_payloads[0]["payload"].content)

    async def test_monitor_adapter_injection(self):
        """Verify BaseMonitor can be initialized with a custom delivery adapter."""
        custom = CustomMockAdapter()
        config = {
            "id": 1,
            "name": "Custom Injected Monitor",
            "type": "custom_feed",
            "guild_id": 444,
            "target_channels": [1234]
        }
        monitor = DummyMonitorWithAdapter(self.bot, config, adapter=custom)

        await monitor.send_update(content="Test message directly from monitor")

        self.assertEqual(len(custom.delivered_payloads), 1)
        self.assertEqual(custom.delivered_payloads[0]["payload"].content, "Test message directly from monitor")
        self.assertEqual(custom.delivered_payloads[0]["channels"], [1234])

if __name__ == "__main__":
    unittest.main()
