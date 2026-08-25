import unittest
import os
from unittest.mock import MagicMock, AsyncMock
from starlette.testclient import TestClient
from core.webhook_server import app, setup_webhook_bot

class TestFastAPIEndpoints(unittest.TestCase):
    def setUp(self):
        os.environ["WEBHOOK_SECRET"] = "test_secret_123"
        self.bot = MagicMock()
        self.bot.config = {
            "webhook_secret": "test_secret_123",
            "tier_config": {
                "0": {"name": "Free Tier", "features": ["basic"]},
                "1": {"name": "Bronze Tier", "features": ["custom_colors"]},
                "2": {"name": "Silver Tier", "features": ["custom_branding"]},
                "3": {"name": "Gold Tier", "features": ["all"]}
            }
        }
        self.bot.guild_settings_cache = {
            100: {"tier": 2, "language": "hu"}
        }
        self.bot.is_premium.return_value = True
        self.bot.reload_guild_settings_cache = AsyncMock()

        self.bot.monitor_manager = MagicMock()
        self.bot.monitor_manager.sync_with_db = AsyncMock(return_value=True)
        self.bot.monitor_manager.manual_check = AsyncMock(return_value=(True, "Checked successfully"))
        self.bot.monitor_manager.repost_recent = AsyncMock(return_value=True)
        self.bot.monitor_manager.purge_channel = AsyncMock(return_value=True)

        setup_webhook_bot(self.bot)
        self.client = TestClient(app)

    def tearDown(self):
        os.environ.pop("WEBHOOK_SECRET", None)

    def test_health_endpoint(self):
        """Verify /health endpoint returns 200 and ok status."""
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {"status": "ok"})

    def test_sync_monitors_endpoint(self):
        """Verify /monitors/sync triggers database synchronization."""
        resp = self.client.post("/monitors/sync")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "success")
        self.bot.monitor_manager.sync_with_db.assert_called_once()

    def test_manual_check_endpoint_authorized(self):
        """Verify /monitors/{id}/check runs manual check with secret auth."""
        headers = {"X-Webhook-Secret": "test_secret_123"}
        resp = self.client.post("/monitors/42/check", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "success")
        self.bot.monitor_manager.manual_check.assert_called_once_with(42)

    def test_manual_check_endpoint_unauthorized(self):
        """Verify /monitors/{id}/check rejects invalid secret."""
        headers = {"X-Webhook-Secret": "wrong_secret"}
        resp = self.client.post("/monitors/42/check", headers=headers)
        self.assertEqual(resp.status_code, 401)

    def test_guild_permissions_endpoint(self):
        """Verify /guilds/{guild_id}/permissions/{user_id} returns tier and feature limits."""
        headers = {"X-Webhook-Secret": "test_secret_123"}
        resp = self.client.get("/guilds/100/permissions/555", headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["tier"], 2)
        self.assertEqual(data["tier_name"], "Silver Tier")

if __name__ == "__main__":
    unittest.main()
