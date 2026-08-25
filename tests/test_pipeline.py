import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from engine.pipeline import FeedPipeline

class TestFeedPipeline(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.pipeline = FeedPipeline(self.bot)

    async def test_process_unshared_silent_start(self):
        """Verify silent seeding on first run (seeds history without posting)."""
        monitor = MagicMock()
        monitor.id = 1
        monitor.name = "Test RSS"
        monitor.platform = "rss"
        monitor.guild_id = 100
        monitor.is_first_run = True
        monitor.get_item_id = MagicMock(side_effect=lambda item: item["id"])
        monitor.fetch_new_items = AsyncMock(return_value=[
            {"id": "item_1", "title": "Old News"},
            {"id": "item_2", "title": "Older News"}
        ])
        monitor.process_item = AsyncMock()
        monitor.mark_items_published = AsyncMock()

        with patch("db.monitor_repo.get_published_ids_bulk", new_callable=AsyncMock) as mock_get_pub:
            mock_get_pub.return_value = set()
            await self.pipeline.process_unshared(monitor)

            # In silent start mode, process_item (posting to Discord) should NOT be called
            monitor.process_item.assert_not_called()
            # Items should be marked published in DB
            monitor.mark_items_published.assert_called_once()
            # is_first_run should be cleared to False for subsequent runs
            self.assertFalse(monitor.is_first_run)

    async def test_process_unshared_new_items_posted(self):
        """Verify normal mode posts only unpublished new items."""
        monitor = MagicMock()
        monitor.id = 2
        monitor.name = "Active Monitor"
        monitor.platform = "youtube"
        monitor.guild_id = 200
        monitor.is_first_run = False
        monitor.get_item_id = MagicMock(side_effect=lambda item: item["id"])
        monitor.fetch_new_items = AsyncMock(return_value=[
            {"id": "vid_1", "title": "New Video"},
            {"id": "vid_2", "title": "Already Published Video"}
        ])
        monitor.process_item = AsyncMock()
        monitor.mark_items_published = AsyncMock()

        with patch("db.monitor_repo.get_published_ids_bulk", new_callable=AsyncMock) as mock_get_pub:
            # vid_2 is already published in DB
            mock_get_pub.return_value = {"vid_2"}
            await self.pipeline.process_unshared(monitor)

            # Only vid_1 should be posted to Discord
            self.assertEqual(monitor.process_item.call_count, 1)
            monitor.process_item.assert_called_once_with({"id": "vid_1", "title": "New Video"})
            # All items should be marked published
            monitor.mark_items_published.assert_called_once_with([
                {"id": "vid_1", "title": "New Video"},
                {"id": "vid_2", "title": "Already Published Video"}
            ])

    async def test_error_isolation_between_monitors(self):
        """Verify that an error in one monitor does not stop others in a shared group."""
        m1 = MagicMock()
        m1.id = 10
        m1.guild_id = 1000
        m1.platform = "youtube"
        m1.is_first_run = False
        m1.get_item_id = MagicMock(side_effect=lambda item: item["id"])
        m1.process_item = AsyncMock(side_effect=Exception("Discord API Failure on M1"))
        m1.mark_items_published = AsyncMock()

        m2 = MagicMock()
        m2.id = 20
        m2.guild_id = 2000
        m2.platform = "youtube"
        m2.is_first_run = False
        m2.get_item_id = MagicMock(side_effect=lambda item: item["id"])
        m2.process_item = AsyncMock()
        m2.mark_items_published = AsyncMock()

        # m1's primary fetcher returns 1 new item
        m1.fetch_new_items = AsyncMock(return_value=[{"id": "vid_shared", "title": "Shared Video"}])

        with patch("db.monitor_repo.get_published_ids_bulk", new_callable=AsyncMock) as mock_get_pub:
            mock_get_pub.return_value = set()
            await self.pipeline.process_group("yt:channel_xyz", [m1, m2], interval_mins=5)

            # m1 threw error, but m2 must have received and processed the item
            m2.process_item.assert_called_once_with({"id": "vid_shared", "title": "Shared Video"})
            m2.mark_items_published.assert_called_once()

if __name__ == "__main__":
    unittest.main()
