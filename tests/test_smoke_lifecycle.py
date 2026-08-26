import unittest
import asyncio
from unittest.mock import MagicMock, AsyncMock, patch
from workers import run_api_worker, run_feed_worker, run_gateway_worker
from core.container import BotContainer

from clients import http_client

class TestSmokeLifecycle(unittest.IsolatedAsyncioTestCase):
    """
    End-to-End Smoke & Lifecycle tests for all 3 microservice worker runtimes and containers.
    """

    async def test_bot_container_lifecycle(self):
        """Verify BotContainer initialization and graceful shutdown."""
        config = {
            "token": "dummy",
            "tier_config": {},
            "master_guilds": {},
            "master_user_ids": []
        }
        bot = MagicMock()
        container = BotContainer(config=config, bot=bot)

        with patch("db.guild_repo.get_all_guild_settings", new_callable=AsyncMock) as mock_get_guilds, \
             patch("db.bot_settings_repo.get_bot_setting", new_callable=AsyncMock) as mock_get_setting, \
             patch("db.monitor_repo.get_all_monitors", new_callable=AsyncMock) as mock_get_monitors, \
             patch.object(container.crypto_service, "start", new_callable=AsyncMock) as mock_crypto_start, \
             patch.object(container.crypto_service, "stop", new_callable=AsyncMock) as mock_crypto_stop, \
             patch.object(http_client, "close", new_callable=AsyncMock) as mock_http_close:

            mock_get_guilds.return_value = []
            mock_get_setting.return_value = None
            mock_get_monitors.return_value = []

            # 1. Initialize
            await container.initialize()
            mock_crypto_start.assert_called_once()

            # 2. Shutdown
            await container.shutdown()
            mock_crypto_stop.assert_called_once()
            mock_http_close.assert_called_once()

    async def test_api_worker_smoke_startup(self):
        """Verify API Worker startup, DB pool init, and server serve hook."""
        with patch("logger.setup_logging"), \
             patch("workers.api_worker.BotConfig.load") as mock_cfg, \
             patch("workers.api_worker.create_db_pool", new_callable=AsyncMock) as mock_pool, \
             patch("workers.api_worker.init_db", new_callable=AsyncMock) as mock_init, \
             patch("workers.api_worker.close", new_callable=AsyncMock) as mock_close, \
             patch("uvicorn.Server.serve", new_callable=AsyncMock) as mock_serve:

            mock_cfg.return_value = {"database_url": "postgresql://mock"}
            await run_api_worker()

            mock_pool.assert_called_once()
            mock_init.assert_called_once()
            mock_serve.assert_called_once()
            mock_close.assert_called_once()

    async def test_feed_worker_smoke_startup(self):
        """Verify Feed Worker single polling loop lifecycle."""
        with patch("logger.setup_logging"), \
             patch("workers.feed_worker.BotConfig.load") as mock_cfg, \
             patch("workers.feed_worker.create_db_pool", new_callable=AsyncMock) as mock_pool, \
             patch("workers.feed_worker.init_db", new_callable=AsyncMock) as mock_init, \
             patch("workers.feed_worker.close", new_callable=AsyncMock) as mock_close, \
             patch("workers.feed_worker.monitor_repo.get_all_monitors", new_callable=AsyncMock) as mock_monitors, \
             patch("asyncio.sleep", side_effect=asyncio.CancelledError):

            mock_cfg.return_value = {"database_url": "postgresql://mock"}
            mock_monitors.return_value = []

            await run_feed_worker(poll_interval=1)

            mock_pool.assert_called_once()
            mock_init.assert_called_once()
            mock_close.assert_called_once()

    async def test_gateway_worker_smoke_startup(self):
        """Verify Gateway Worker initialization and consumer start."""
        with patch("logger.setup_logging"), \
             patch("workers.gateway_worker.BotConfig.load") as mock_cfg, \
             patch("workers.gateway_worker.create_db_pool", new_callable=AsyncMock) as mock_pool, \
             patch("workers.gateway_worker.init_db", new_callable=AsyncMock) as mock_init, \
             patch("workers.gateway_worker.close", new_callable=AsyncMock) as mock_close, \
             patch("core.bot.FeedBot.start", new_callable=AsyncMock) as mock_bot_start:

            mock_cfg.return_value = {"database_url": "postgresql://mock", "token": "mock_token"}
            await run_gateway_worker()

            mock_pool.assert_called_once()
            mock_init.assert_called_once()
            mock_bot_start.assert_called_once_with("mock_token")
            mock_close.assert_called_once()

if __name__ == "__main__":
    unittest.main()
