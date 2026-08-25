import unittest
import time
from unittest.mock import MagicMock, AsyncMock, patch
from monitors.rss_monitor import RSSMonitor

class TestRSSMonitor(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.monitor_manager = None

    def test_rss_image_extraction_sources(self):
        """Verify image extraction across media_thumbnail, enclosures, and HTML description."""
        monitor = RSSMonitor(self.bot, {"id": 1, "feed_url": "https://example.com/feed.xml"})

        # 1. media_thumbnail
        e1 = {"media_thumbnail": [{"url": "https://example.com/thumb.jpg"}]}
        self.assertEqual(monitor._extract_image(e1), "https://example.com/thumb.jpg")

        # 2. Image Enclosure
        e2 = {"enclosures": [{"type": "image/png", "href": "https://example.com/enclosure.png"}]}
        self.assertEqual(monitor._extract_image(e2), "https://example.com/enclosure.png")

        # 3. HTML Description
        e3 = {"description": "<p>Article text <img src=\"https://example.com/desc_img.jpg\" /> more text</p>"}
        self.assertEqual(monitor._extract_image(e3), "https://example.com/desc_img.jpg")

    def test_rss_timestamp_extraction(self):
        """Verify published_parsed and updated_parsed extraction."""
        monitor = RSSMonitor(self.bot, {"id": 2, "feed_url": "https://example.com/feed.xml"})

        # (2026, 8, 25, 12, 0, 0, 1, 237, 0)
        time_struct = time.gmtime(1787659200)
        
        # published_parsed
        e1 = {"published_parsed": time_struct}
        self.assertEqual(monitor._extract_timestamp(e1), 1787659200)

        # updated_parsed fallback
        e2 = {"updated_parsed": time_struct}
        self.assertEqual(monitor._extract_timestamp(e2), 1787659200)

    async def test_rss_old_item_skipped(self):
        """Verify that RSS entries older than 48 hours are not sent."""
        monitor = RSSMonitor(self.bot, {"id": 3, "feed_url": "https://example.com/feed.xml"})
        monitor.send_update = AsyncMock()

        # 72 hours ago
        old_time_struct = time.gmtime(time.time() - (72 * 3600))
        entry = {
            "id": "item_ancient",
            "title": "Ancient News",
            "link": "https://example.com/ancient",
            "published_parsed": old_time_struct
        }
        await monitor.process_item(entry)
        monitor.send_update.assert_not_called()

    async def test_mark_items_published_bulk(self):
        """Verify mark_items_published prepares and calls bulk insert in DB."""
        monitor = RSSMonitor(self.bot, {"id": 4, "feed_url": "https://example.com/feed.xml"})
        monitor.guild_id = 999

        entries = [
            {"id": "entry_1", "title": "News 1", "author": "Alice"},
            {"link": "https://example.com/entry_2", "title": "News 2"}
        ]

        with patch("db.monitor_repo.mark_as_published_bulk", new_callable=AsyncMock) as mock_bulk:
            await monitor.mark_items_published(entries)
            mock_bulk.assert_called_once()
            records = mock_bulk.call_args[0][0]
            self.assertEqual(len(records), 2)
            self.assertEqual(records[0]["entry_id"], "entry_1")
            self.assertEqual(records[1]["entry_id"], "https://example.com/entry_2")

if __name__ == "__main__":
    unittest.main()
