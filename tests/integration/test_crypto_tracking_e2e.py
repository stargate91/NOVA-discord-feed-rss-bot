import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from services.crypto_service import CryptoService
from monitors.crypto_monitor import CryptoMonitor

class TestCryptoTrackingE2EIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.guild_settings_cache = {100: {}}
        self.bot.monitor_manager = None

        self.crypto_service = CryptoService(self.bot)
        self.bot.crypto_service = self.crypto_service

    async def test_crypto_price_threshold_alert_e2e(self):
        """Test full crypto pipeline: Service mapping -> Price update -> Monitor threshold breach -> Discord alert dispatched -> No repeat spam."""
        # 1. Mock CoinGecko coin map
        self.crypto_service.client.fetch_coin_list = AsyncMock(return_value=[
            {"id": "bitcoin", "symbol": "btc", "name": "Bitcoin"},
            {"id": "ethereum", "symbol": "eth", "name": "Ethereum"}
        ])

        # 2. Setup Monitor targeting BTC: 100,000 USD
        monitor_config = {
            "id": 88,
            "guild_id": 100,
            "source_id": "BTC:100000",
            "name": "BTC Moon Alert",
            "target_channels": [123]
        }
        monitor = CryptoMonitor(self.bot, monitor_config)
        monitor.send_update = AsyncMock()

        # Initialize coin mapping
        await monitor._update_coin_map()

        # 3. Simulate Price Tick 1: BTC is at 98,000 USD (Baseline established)
        self.crypto_service.client.fetch_prices = AsyncMock(return_value={"bitcoin": 98000.0})
        await self.crypto_service._fetch_prices()

        items = await monitor.fetch_new_items()
        self.assertEqual(len(items), 0, "Alert triggered on initial baseline tick!")

        # 4. Simulate Price Tick 2: BTC crosses threshold to 101,500 USD (Threshold breached)
        self.crypto_service.client.fetch_prices = AsyncMock(return_value={"bitcoin": 101500.0})
        await self.crypto_service._fetch_prices()

        with patch("db.monitor_repo.mark_as_published", new_callable=AsyncMock) as mock_pub:
            items = await monitor.fetch_new_items()
            self.assertEqual(len(items), 1, "Monitor failed to detect threshold crossing!")

            # Process the alert and mark published
            await monitor.process_item(items[0])
            await monitor.mark_items_published(items)
            monitor.send_update.assert_called_once()
            mock_pub.assert_called_once()

            # 5. Simulate Price Tick 3: BTC stays at 101,500 USD (No spam alert)
            monitor.send_update.reset_mock()
            items_repeat = await monitor.fetch_new_items()
            self.assertEqual(len(items_repeat), 0, "Duplicate alert sent while price remained at same level!")

if __name__ == "__main__":
    unittest.main()
