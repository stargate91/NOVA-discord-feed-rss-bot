import os
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from starlette.testclient import TestClient
from core.webhook_server import app, setup_webhook_bot
from core.monitor_manager import MonitorManager
from monitors.youtube_monitor import YouTubeMonitor

class TestMaintenanceAPIFlowIntegration(unittest.TestCase):
    def setUp(self):
        os.environ["WEBHOOK_SECRET"] = "maint_secret_123"
        self.bot = MagicMock()
        self.bot.config = {"webhook_secret": "maint_secret_123"}
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.guild_settings_cache = {100: {}}
        self.bot.reload_guild_settings_cache = AsyncMock()

        # Setup real MonitorManager
        self.manager = MonitorManager(self.bot, self.bot.config)
        self.bot.monitor_manager = self.manager

        setup_webhook_bot(self.bot)
        self.client = TestClient(app)

    def tearDown(self):
        os.environ.pop("WEBHOOK_SECRET", None)

    def test_manual_check_api_integration(self):
        """Test POST /monitors/{id}/check endpoint performs manual check and returns success."""
        monitor = YouTubeMonitor(self.bot, {
            "id": 42,
            "guild_id": 100,
            "channel_id": "UC1234567890123456789012",
            "name": "Live Tech"
        })
        monitor.fetch_new_items = AsyncMock(return_value=[{"id": "vid_new", "title": "New Vid"}])
        monitor.process_item = AsyncMock()
        monitor.mark_items_published = AsyncMock()

        self.manager.monitors = [monitor]

        with patch("db.monitor_repo.is_published", new_callable=AsyncMock) as mock_is_pub:
            mock_is_pub.return_value = False

            headers = {"X-Webhook-Secret": "maint_secret_123"}
            resp = self.client.post("/monitors/42/check", headers=headers)

            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["status"], "success")

    def test_repost_recent_api_integration(self):
        """Test POST /monitors/{id}/repost endpoint fetches and sends recent items."""
        monitor = YouTubeMonitor(self.bot, {
            "id": 42,
            "guild_id": 100,
            "channel_id": "UC1234567890123456789012",
            "name": "Live Tech"
        })
        monitor.get_latest_items = AsyncMock(return_value=[
            {"content": "Alert 1", "view": MagicMock(), "title": "Vid 1"},
            {"content": "Alert 2", "view": MagicMock(), "title": "Vid 2"}
        ])
        monitor.send_update = AsyncMock()

        self.manager.monitors = [monitor]

        headers = {"X-Webhook-Secret": "maint_secret_123"}
        resp = self.client.post("/monitors/42/repost?count=2", headers=headers)

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "success")
        self.assertEqual(monitor.send_update.call_count, 2)

if __name__ == "__main__":
    unittest.main()
