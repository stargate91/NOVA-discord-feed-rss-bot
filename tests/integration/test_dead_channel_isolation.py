import unittest
import discord
from unittest.mock import MagicMock, AsyncMock, patch
from monitors.youtube_monitor import YouTubeMonitor
from services import is_channel_dead

class TestDeadChannelIsolationIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.guild_settings_cache = {100: {}}
        self.bot.monitor_manager = None

    async def test_multi_channel_dispatch_with_dead_channel_isolation(self):
        """Test sending alert to 3 channels where Channel 2 throws 403 Forbidden: Channel 1 and 3 receive alert, Channel 2 is blacklisted."""
        m_config = {
            "id": 55,
            "guild_id": 100,
            "channel_id": "UC12345678901234567890123",
            "name": "Multi Channel Monitor",
            "target_channels": [1001, 1002, 1003]
        }
        monitor = YouTubeMonitor(self.bot, m_config)

        # Channel 1: Healthy
        ch1 = MagicMock()
        ch1.name = "announcements"
        ch1.send = AsyncMock()

        # Channel 2: Forbidden (Bot was kicked or lacks permission)
        ch2_exc = discord.Forbidden(response=MagicMock(status=403), message="Missing Permissions")

        # Channel 3: Healthy
        ch3 = MagicMock()
        ch3.name = "feed-archive"
        ch3.send = AsyncMock()

        def mock_get_channel(cid):
            if cid == 1001:
                return ch1
            elif cid == 1003:
                return ch3
            return None

        async def mock_fetch_channel(cid):
            if cid == 1002:
                raise ch2_exc
            return None

        self.bot.get_channel.side_effect = mock_get_channel
        self.bot.fetch_channel.side_effect = mock_fetch_channel

        with patch("db.monitor_repo.increment_post_stat", new_callable=AsyncMock) as mock_inc, \
             patch("db.monitor_repo.update_last_post_at", new_callable=AsyncMock) as mock_last_post:

            # Send update to all 3 channels
            await monitor.send_update(content="New Video Released!", embed=None, view=None)

            # 1. Channel 1 must have received the message
            ch1.send.assert_called_once_with(content="New Video Released!", embed=None, view=None)

            # 2. Channel 2 must now be marked DEAD in the blacklist
            self.assertTrue(is_channel_dead(1002), "Channel 1002 was not blacklisted after 403 Forbidden!")

            # 3. Channel 3 must have received the message
            ch3.send.assert_called_once_with(content="New Video Released!", embed=None, view=None)

            # 4. Stats were incremented for the 2 successful deliveries
            self.assertEqual(mock_inc.call_count, 2)
            self.assertEqual(mock_last_post.call_count, 2)

            # --- Subsequent Alert Attempt ---
            ch1.send.reset_mock()
            ch3.send.reset_mock()
            self.bot.fetch_channel.reset_mock()

            # Next alert should immediately skip channel 1002 without making any Discord API network calls
            await monitor.send_update(content="Another Video!", embed=None, view=None)

            self.bot.fetch_channel.assert_not_called()
            ch1.send.assert_called_once()
            ch3.send.assert_called_once()

if __name__ == "__main__":
    unittest.main()
