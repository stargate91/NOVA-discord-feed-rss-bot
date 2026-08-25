import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from services.maintenance_service import MaintenanceService

class TestMaintenanceService(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.service = MaintenanceService(self.bot)

    async def test_manual_check_monitor_not_found(self):
        """Verify handling when monitor object is None."""
        success, msg = await self.service.manual_check(None)
        self.assertFalse(success)
        self.assertIn("not found", msg.lower())

    async def test_cleanup_history_calls_repo(self):
        """Verify data retention purge calls monitor_repo.cleanup_old_history."""
        with patch("db.monitor_repo.cleanup_old_history", new_callable=AsyncMock) as mock_cleanup:
            mock_cleanup.return_value = 42
            deleted = await self.service.cleanup_history(days=30)
            self.assertEqual(deleted, 42)
            mock_cleanup.assert_called_once_with(days=30)

    async def test_factory_reset_calls_repo(self):
        """Verify factory reset triggers table truncation."""
        with patch("db.monitor_repo.factory_reset_tables", new_callable=AsyncMock) as mock_reset:
            success = await self.service.factory_reset()
            self.assertTrue(success)
            mock_reset.assert_called_once()

    async def test_purge_channel_lacking_permission(self):
        """Verify purge skips channel if bot lacks Manage Messages permission."""
        channel = MagicMock()
        channel.permissions_for.return_value.manage_messages = False
        self.bot.get_channel.return_value = channel

        monitor = MagicMock()
        monitor.name = "Test Channel"
        monitor.target_channels = [123456]

        success = await self.service.purge_channel(monitor, amount=10)
        self.assertFalse(success)
        channel.purge.assert_not_called()

if __name__ == "__main__":
    unittest.main()
