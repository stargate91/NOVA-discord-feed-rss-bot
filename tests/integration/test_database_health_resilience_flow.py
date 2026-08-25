import unittest
from unittest.mock import MagicMock, AsyncMock
from starlette.testclient import TestClient
from core.webhook_server import app, setup_webhook_bot
from db import connection

class TestDatabaseHealthResilienceFlowIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.config = {}
        setup_webhook_bot(self.bot)
        self.client = TestClient(app)

    async def test_database_pool_lifecycle_and_resilience(self):
        """Test database connection pool lifecycle: uninitialized error -> pool assignment -> execution -> graceful shutdown."""
        # 1. Uninitialized state: get_pool raises Exception
        await connection.set_pool(None)
        with self.assertRaises(Exception) as ctx:
            await connection.get_pool()
        self.assertIn("not initialized", str(ctx.exception).lower())

        # 2. Pool initialization: Mock asyncpg pool
        mock_pool = MagicMock()
        mock_pool.fetch = AsyncMock(return_value=[{"col": 1}])
        mock_pool.fetchrow = AsyncMock(return_value={"col": 1})
        mock_pool.fetchval = AsyncMock(return_value=1)
        mock_pool.execute = AsyncMock(return_value="UPDATE 1")
        mock_pool.close = AsyncMock()

        await connection.set_pool(mock_pool)
        active_pool = await connection.get_pool()
        self.assertIs(active_pool, mock_pool)

        # 3. Verify helper executions route through pool
        rows = await connection._fetch("SELECT * FROM guilds")
        self.assertEqual(len(rows), 1)

        row = await connection._fetchrow("SELECT * FROM guilds WHERE id = $1", 100)
        self.assertEqual(row["col"], 1)

        val = await connection._fetchval("SELECT COUNT(*) FROM guilds")
        self.assertEqual(val, 1)

        exec_res = await connection._execute("UPDATE guilds SET tier = 1")
        self.assertEqual(exec_res, "UPDATE 1")

        # 4. Graceful pool closure
        await connection.close()
        mock_pool.close.assert_called_once()
        self.assertIsNone(connection._pool)

    def test_healthcheck_endpoint_availability(self):
        """Test FastAPI /health diagnostic endpoint."""
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")

if __name__ == "__main__":
    unittest.main()
