import unittest
from unittest.mock import MagicMock, AsyncMock
from monitors.stream_monitor import TwitchMonitor, KickMonitor

class TestStreamMonitor(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.monitor_manager = None

    def test_username_extraction_from_urls(self):
        """Verify username parsing from full channel URLs."""
        # Twitch URL
        m_twitch = TwitchMonitor(self.bot, {"name": "Test", "username": "https://www.twitch.tv/shroud?referral=true"})
        self.assertEqual(m_twitch.stream_username, "shroud")

        # Kick URL
        m_kick = KickMonitor(self.bot, {"name": "Test", "username": "https://kick.com/xqc"})
        self.assertEqual(m_kick.stream_username, "xqc")

    async def test_live_transition_lifecycle(self):
        """Verify stream status state machine: offline -> live (triggers alert) -> still live (no duplicate) -> offline."""
        monitor = TwitchMonitor(self.bot, {"name": "Test Streamer", "username": "streamer123"})
        monitor.process_item = AsyncMock()
        monitor.is_silent_start = False
        monitor.is_live = False

        # 1. Stream goes LIVE from Offline
        monitor._fetch_platform_data = AsyncMock(return_value={
            "is_live": True,
            "title": "Road to Diamond",
            "game": "Valorant",
            "viewers": 5000
        })
        await monitor.fetch_new_items()
        self.assertTrue(monitor.is_live)
        self.assertEqual(monitor.process_item.call_count, 1)

        # 2. Next tick: Stream is STILL live (no duplicate notification)
        await monitor.fetch_new_items()
        self.assertTrue(monitor.is_live)
        self.assertEqual(monitor.process_item.call_count, 1)  # Still 1, not called again

        # 3. Next tick: Stream goes OFFLINE
        monitor._fetch_platform_data = AsyncMock(return_value={"is_live": False})
        await monitor.fetch_new_items()
        self.assertFalse(monitor.is_live)
        self.assertEqual(monitor.process_item.call_count, 1)

if __name__ == "__main__":
    unittest.main()
