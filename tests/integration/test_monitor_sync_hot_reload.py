import os
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from core.monitor_manager import MonitorManager
from engine.scheduler import PollingScheduler
from engine.pipeline import FeedPipeline
from starlette.testclient import TestClient
from core.webhook_server import app, setup_webhook_bot

class TestMonitorSyncHotReloadIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        os.environ["WEBHOOK_SECRET"] = "test_secret"
        self.bot = MagicMock()
        self.bot.config = {"webhook_secret": "test_secret"}
        self.bot.has_feature.return_value = True
        self.bot.get_guild_refresh_interval.return_value = 5
        self.bot.reload_guild_settings_cache = AsyncMock()

        self.pipeline = FeedPipeline(self.bot)
        self.manager = MonitorManager(self.bot, self.bot.config)
        self.bot.monitor_manager = self.manager

        setup_webhook_bot(self.bot)
        self.client = TestClient(app)

    def tearDown(self):
        os.environ.pop("WEBHOOK_SECRET", None)

    async def test_hot_reload_sync_and_state_preservation(self):
        """Test hot-reloading monitors from DB preserves live states and re-indexes scheduler without dropping connections."""
        # 1. Initial State: 1 Active Twitch Monitor that is currently LIVE
        initial_db_monitors = [
            {
                "id": 1,
                "guild_id": 100,
                "name": "LiveStreamer",
                "type": "twitch",
                "username": "streamer1",
                "enabled": True,
                "target_channels": [111]
            }
        ]

        with patch("db.monitor_repo.get_all_monitors", new_callable=AsyncMock) as mock_get_all:
            mock_get_all.return_value = initial_db_monitors
            await self.manager.sync_with_db(is_startup=True)

            self.assertEqual(len(self.manager.monitors), 1)
            active_m = self.manager.monitors[0]
            active_m.is_live = True
            active_m.is_first_run = False

            # 2. Database is updated (1 monitor modified, 1 new RSS monitor added)
            updated_db_monitors = [
                {
                    "id": 1,
                    "guild_id": 100,
                    "name": "LiveStreamer",
                    "type": "twitch",
                    "username": "streamer1",
                    "enabled": True,
                    "target_channels": [111, 222]  # Added a second channel
                },
                {
                    "id": 2,
                    "guild_id": 100,
                    "name": "Gaming News",
                    "type": "rss",
                    "rss_url": "https://example.com/feed.xml",
                    "enabled": True,
                    "target_channels": [333]
                }
            ]
            mock_get_all.return_value = updated_db_monitors

            # 3. Web Dashboard triggers /monitors/sync endpoint
            headers = {"X-Webhook-Secret": "test_secret"}
            resp = self.client.post("/monitors/sync", headers=headers)
            self.assertEqual(resp.status_code, 200)

            # 4. Verify MonitorManager synchronized
            await self.manager.sync_with_db(is_startup=False)

            self.assertEqual(len(self.manager.monitors), 2)

            reloaded_twitch = next(m for m in self.manager.monitors if m.id == 1)
            reloaded_rss = next(m for m in self.manager.monitors if m.id == 2)

            # 5. Verify state was preserved on existing monitor
            self.assertTrue(reloaded_twitch.is_live, "is_live state was lost across sync!")
            self.assertFalse(reloaded_twitch.is_first_run, "is_first_run state was lost across sync!")

            # 6. Verify new monitor got silent start protection
            self.assertTrue(reloaded_rss.is_silent_start, "New monitor missing silent start flag!")

            # 7. Verify PollingScheduler groups both monitors seamlessly
            scheduler = PollingScheduler(self.bot, self.pipeline, lambda: self.manager.monitors)
            groups = {}
            for m in scheduler.get_monitors():
                groups.setdefault(m.get_shared_key(), []).append(m)

            self.assertIn("twitch:streamer1", groups)
            self.assertIn("rss:https://example.com/feed.xml", groups)

if __name__ == "__main__":
    unittest.main()
