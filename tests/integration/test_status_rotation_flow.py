import unittest
import discord
from unittest.mock import MagicMock, AsyncMock, patch
from cogs.status_cog import StatusCog

class TestStatusRotationFlowIntegration(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.bot = MagicMock()
        self.bot.is_ready.return_value = True
        self.bot.change_presence = AsyncMock()

        self.bot.monitor_manager = MagicMock()
        self.bot.monitor_manager.monitors = [MagicMock(), MagicMock(), MagicMock(), MagicMock(), MagicMock()] # 5 monitors

        self.cog = StatusCog(self.bot)
        # Cancel the background auto-task so we control execution step-by-step
        self.cog.status_rotation.cancel()

    async def asyncTearDown(self):
        self.cog.status_rotation.cancel()

    async def test_sequential_status_rotation_with_dynamic_count(self):
        """Test sequential status rotation replacing {count} with real monitor count."""
        mock_db_statuses = [
            {"text": "Monitoring {count} feeds", "type": "watching"},
            {"text": "Gaming with {count} channels", "type": "playing"}
        ]

        with patch("db.bot_settings_repo.get_bot_statuses", new_callable=AsyncMock) as mock_get_statuses, \
             patch("db.bot_settings_repo.get_bot_setting", new_callable=AsyncMock) as mock_get_setting:

            mock_get_statuses.return_value = mock_db_statuses
            mock_get_setting.return_value = "sequential"

            # --- Rotation Tick 1 ---
            await self.cog.status_rotation()

            self.bot.change_presence.assert_called_once()
            call_activity_1 = self.bot.change_presence.call_args[1]["activity"]
            self.assertEqual(call_activity_1.name, "Monitoring 5 feeds")
            self.assertEqual(call_activity_1.type, discord.ActivityType.watching)

            # --- Rotation Tick 2 ---
            self.bot.change_presence.reset_mock()
            await self.cog.status_rotation()

            self.bot.change_presence.assert_called_once()
            call_activity_2 = self.bot.change_presence.call_args[1]["activity"]
            self.assertEqual(call_activity_2.name, "Gaming with 5 channels")
            self.assertEqual(call_activity_2.type, discord.ActivityType.playing)

            # --- Rotation Tick 3 (Loops back to first item) ---
            self.bot.change_presence.reset_mock()
            await self.cog.status_rotation()

            self.bot.change_presence.assert_called_once()
            call_activity_3 = self.bot.change_presence.call_args[1]["activity"]
            self.assertEqual(call_activity_3.name, "Monitoring 5 feeds")

if __name__ == "__main__":
    unittest.main()
