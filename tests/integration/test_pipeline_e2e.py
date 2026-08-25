import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from engine.pipeline import FeedPipeline
from engine.cache import SharedDataCache
from monitors.youtube_monitor import YouTubeMonitor
from monitors.base_game_monitor import BaseGameGiveawayMonitor

class TestPipelineE2EIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.guild_settings_cache = {
            100: {"custom_branding": "Custom Sponsor"}
        }

        # Initialize shared cache
        self.cache = SharedDataCache(max_size=500)
        self.bot.monitor_manager = MagicMock()
        self.bot.monitor_manager.cache = self.cache
        self.bot.monitor_manager.get_shared_data.side_effect = self.cache.get_shared_data
        self.bot.monitor_manager.set_shared_data.side_effect = self.cache.set_shared_data

        self.pipeline = FeedPipeline(self.bot)

    async def test_youtube_ingestion_end_to_end(self):
        """Test full YouTube ingestion: Fetch -> Shared Cache -> Deduplication -> UI Builder -> DB Commit -> Repeat tick 0 items."""
        m_config = {
            "id": 10,
            "guild_id": 100,
            "channel_id": "UC1234567890123456789012",
            "name": "Tech Channel",
            "target_channels": [123456789]
        }
        monitor = YouTubeMonitor(self.bot, m_config)
        monitor.is_first_run = False
        monitor.send_update = AsyncMock()

        raw_feed_items = [
            {
                "id": "yt:video:vid_001",
                "title": "Unboxing Future Tech",
                "link": "https://www.youtube.com/watch?v=vid_001",
                "author": "Tech Channel",
                "published_ts": 1787659200
            },
            {
                "id": "yt:video:vid_002",
                "title": "Review of Gadget",
                "link": "https://www.youtube.com/watch?v=vid_002",
                "author": "Tech Channel",
                "published_ts": 1787659300
            }
        ]

        monitor.client.fetch_channel_feed = AsyncMock(return_value=raw_feed_items)

        # Database state: vid_001 is already published, vid_002 is brand new
        published_db_set = {"vid_001"}

        async def mock_get_bulk(ids, platform, guild_id):
            return published_db_set.intersection(ids)

        async def mock_mark_bulk(records):
            for r in records:
                published_db_set.add(r["entry_id"])

        with patch("db.monitor_repo.get_published_ids_bulk", side_effect=mock_get_bulk), \
             patch("db.monitor_repo.mark_as_published_bulk", side_effect=mock_mark_bulk):

            # --- RUN 1: Process unshared monitor ---
            await self.pipeline.process_unshared(monitor)

            # 1. Verify only vid_002 was sent to Discord
            self.assertEqual(monitor.send_update.call_count, 1)
            call_kwargs = monitor.send_update.call_args[1]
            self.assertIn("view", call_kwargs)
            # LayoutView was constructed
            self.assertIsNotNone(call_kwargs["view"])

            # 2. Verify vid_002 is now in DB published set
            self.assertIn("vid_002", published_db_set)

            # --- RUN 2: Next polling tick (Feed returns same items) ---
            monitor.send_update.reset_mock()
            await self.pipeline.process_unshared(monitor)

            # 3. Verify exactly 0 duplicate alerts sent
            monitor.send_update.assert_not_called()

    async def test_shared_group_multi_guild_distribution(self):
        """Test multi-guild shared feed distribution: 1 network fetch dispatches to Guild A and Guild B with separate DB deduplication."""
        m_guild_a = BaseGameGiveawayMonitor(self.bot, {"id": 1, "guild_id": 1000}, "Steam", "<:steam:123>", "steam")
        m_guild_a.is_first_run = False
        m_guild_a.send_update = AsyncMock()

        m_guild_b = BaseGameGiveawayMonitor(self.bot, {"id": 2, "guild_id": 2000}, "Steam", "<:steam:123>", "steam")
        m_guild_b.is_first_run = False
        m_guild_b.send_update = AsyncMock()

        # Guild A already received game 500, Guild B has not
        db_records = {
            1000: {"500"},
            2000: set()
        }

        async def mock_get_bulk(ids, platform, guild_id):
            return db_records.get(guild_id, set()).intersection(ids)

        async def mock_mark_bulk(records):
            for r in records:
                db_records.setdefault(r["guild_id"], set()).add(r["entry_id"])

        m_guild_a.client.fetch_giveaways = AsyncMock(return_value=[
            {"id": 500, "title": "Game A", "type": "Game", "worth": "$19.99"},
            {"id": 600, "title": "Game B", "type": "Game", "worth": "$29.99"}
        ])

        with patch("db.monitor_repo.get_published_ids_bulk", side_effect=mock_get_bulk), \
             patch("db.monitor_repo.mark_as_published_bulk", side_effect=mock_mark_bulk):

            await self.pipeline.process_group("steam_free_giveaways", [m_guild_a, m_guild_b], interval_mins=5)

            # Guild A only receives Game 600 (Game 500 was already published)
            self.assertEqual(m_guild_a.send_update.call_count, 1)

            # Guild B receives BOTH Game 500 and Game 600
            self.assertEqual(m_guild_b.send_update.call_count, 2)

            # Both guilds are now up to date in DB
            self.assertEqual(db_records[1000], {"500", "600"})
            self.assertEqual(db_records[2000], {"500", "600"})

if __name__ == "__main__":
    unittest.main()
