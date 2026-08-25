import unittest
from unittest.mock import MagicMock, AsyncMock
from monitors.base_game_monitor import BaseGameGiveawayMonitor

class TestBaseGameMonitor(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.monitor_manager = None

    async def test_dlc_filtering_disabled_by_default(self):
        """Verify that DLC items are excluded when include_dlc is False."""
        config = {"id": 1, "type": "steam_free", "include_dlc": False}
        monitor = BaseGameGiveawayMonitor(
            bot=self.bot,
            config=config,
            platform_name="Steam",
            platform_emoji="<:steam:123>",
            gamerpower_platform="steam"
        )
        # Mock GamerPower response with 1 Game and 1 DLC
        monitor.client.fetch_giveaways = AsyncMock(return_value=[
            {"id": 101, "title": "Game A", "type": "Game"},
            {"id": 102, "title": "Game A DLC Pack", "type": "DLC"}
        ])

        items = await monitor.fetch_new_items()
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["id"], 101)

    async def test_dlc_filtering_enabled(self):
        """Verify that DLC items are included when include_dlc is True."""
        config = {"id": 2, "type": "steam_free", "include_dlc": True}
        monitor = BaseGameGiveawayMonitor(
            bot=self.bot,
            config=config,
            platform_name="Steam",
            platform_emoji="<:steam:123>",
            gamerpower_platform="steam"
        )
        monitor.client.fetch_giveaways = AsyncMock(return_value=[
            {"id": 101, "title": "Game A", "type": "Game"},
            {"id": 102, "title": "Game A DLC Pack", "type": "DLC"}
        ])

        items = await monitor.fetch_new_items()
        self.assertEqual(len(items), 2)

    def test_title_formatting(self):
        """Verify platform tags and giveaway keywords are stripped from title."""
        monitor = BaseGameGiveawayMonitor(
            bot=self.bot,
            config={},
            platform_name="Steam",
            platform_emoji="<:steam:123>",
            gamerpower_platform="steam"
        )
        formatted = monitor._format_game_title("Half-Life (Steam) Giveaway")
        self.assertEqual(formatted, "<:steam:123> Half-Life")

if __name__ == "__main__":
    unittest.main()
