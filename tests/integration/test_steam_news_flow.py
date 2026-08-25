import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from monitors.steam_news_monitor import SteamNewsMonitor
from engine.pipeline import FeedPipeline
from engine.cache import SharedDataCache

class TestSteamNewsFlowIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.guild_settings_cache = {100: {}}

        self.cache = SharedDataCache(max_size=500)
        self.bot.monitor_manager = MagicMock()
        self.bot.monitor_manager.cache = self.cache
        self.bot.monitor_manager.get_shared_data.side_effect = self.cache.get_shared_data
        self.bot.monitor_manager.set_shared_data.side_effect = self.cache.set_shared_data

        self.pipeline = FeedPipeline(self.bot)

    async def test_steam_news_pipeline_end_to_end(self):
        """Test full Steam news pipeline: AppID resolution -> News fetch -> BBCode to LayoutView -> DB Commit."""
        monitor_config = {
            "id": 66,
            "guild_id": 100,
            "appid": "730",  # Counter-Strike 2
            "name": "CS2 Updates",
            "target_channels": [555555]
        }
        monitor = SteamNewsMonitor(self.bot, monitor_config)
        monitor.is_first_run = False
        monitor.send_update = AsyncMock()

        raw_news_items = [
            {
                "gid": "steam_news_001",
                "feed_type": 1,
                "title": "Release Notes for Update 1.0",
                "url": "https://store.steampowered.com/news/app/730/view/001",
                "author": "Valve",
                "contents": "[b]Major Changes[/b]\n- Fixed hitbox alignment.\n[img]https://steamcdn.com/banner.jpg[/img]",
                "date": 1787659200
            },
            {
                "gid": "steam_news_002",
                "feed_type": 1,
                "title": "Release Notes for Hotfix 1.0.1",
                "url": "https://store.steampowered.com/news/app/730/view/002",
                "author": "Valve",
                "contents": "[b]Hotfix[/b]\n- Stability optimizations.",
                "date": 1787659300
            }
        ]

        # Seed shared cache with the feed items
        self.cache.set_shared_data(monitor.get_shared_key(), raw_news_items)

        # Database state: steam_news_001 is already published, 002 is brand new
        published_db_set = {"steam_news_001"}

        async def mock_get_bulk(ids, platform, guild_id):
            return published_db_set.intersection(ids)

        async def mock_mark_bulk(records):
            for r in records:
                published_db_set.add(r["entry_id"])

        with patch("db.monitor_repo.get_published_ids_bulk", side_effect=mock_get_bulk), \
             patch("db.monitor_repo.mark_as_published_bulk", side_effect=mock_mark_bulk):

            # --- RUN 1: Process unshared monitor ---
            await self.pipeline.process_unshared(monitor)

            # 1. Verify only steam_news_002 was posted to Discord
            self.assertEqual(monitor.send_update.call_count, 1)
            call_kwargs = monitor.send_update.call_args[1]
            self.assertIn("view", call_kwargs)
            self.assertIsNotNone(call_kwargs["view"])

            # 2. Verify steam_news_002 is committed to DB
            self.assertIn("steam_news_002", published_db_set)

            # --- RUN 2: Next polling tick ---
            monitor.send_update.reset_mock()
            await self.pipeline.process_unshared(monitor)

            # 3. Exactly 0 duplicate alerts sent
            monitor.send_update.assert_not_called()

if __name__ == "__main__":
    unittest.main()
