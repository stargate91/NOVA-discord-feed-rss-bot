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
        self.auth_headers = {"X-Webhook-Secret": "test_secret_123"}

    def tearDown(self):
        os.environ.pop("WEBHOOK_SECRET", None)

    def test_health_endpoint(self):
        """Verify /health and /api/v1/health endpoints return 200 and typed schema."""
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["version"], "1.0.0")

        resp_v1 = self.client.get("/api/v1/health")
        self.assertEqual(resp_v1.status_code, 200)
        self.assertEqual(resp_v1.json()["status"], "ok")

    def test_openapi_documentation_accessible(self):
        """Verify OpenAPI docs and schema are generated and accessible."""
        resp = self.client.get("/openapi.json")
        self.assertEqual(resp.status_code, 200)
        schema = resp.json()
        self.assertEqual(schema["info"]["title"], "Nova Discord Bot API")
        self.assertEqual(schema["info"]["version"], "1.0.0")
        self.assertIn("/api/v1/monitors/sync", schema["paths"])

    def test_sync_monitors_endpoint(self):
        """Verify /monitors/sync and /api/v1/monitors/sync trigger database synchronization."""
        resp = self.client.post("/monitors/sync", headers=self.auth_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "success")

        resp_v1 = self.client.post("/api/v1/monitors/sync", headers=self.auth_headers)
        self.assertEqual(resp_v1.status_code, 200)
        self.assertEqual(resp_v1.json()["status"], "success")
        self.assertEqual(self.bot.monitor_manager.sync_with_db.call_count, 2)

    def test_manual_check_endpoint_authorized(self):
        """Verify /monitors/{id}/check runs manual check with secret auth."""
        headers = {"X-Webhook-Secret": "test_secret_123"}
        resp = self.client.post("/monitors/42/check", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "success")
        self.bot.monitor_manager.manual_check.assert_called_once_with(42)

    def test_manual_check_endpoint_unauthorized(self):
        """Verify /monitors/{id}/check rejects invalid or missing secret."""
        # Wrong secret
        headers = {"X-Webhook-Secret": "wrong_secret"}
        resp = self.client.post("/monitors/42/check", headers=headers)
        self.assertEqual(resp.status_code, 401)

        # Missing secret
        resp_missing = self.client.post("/monitors/42/check")
        self.assertEqual(resp_missing.status_code, 401)

    def test_guild_permissions_endpoint(self):
        """Verify /guilds/{guild_id}/permissions/{user_id} returns tier and feature limits."""
        headers = {"X-Webhook-Secret": "test_secret_123"}
        resp = self.client.get("/guilds/100/permissions/555", headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["tier"], 2)
        self.assertEqual(data["tier_name"], "Silver Tier")

    def test_admin_logs_endpoint(self):
        """Verify /api/v1/admin/logs returns validated LogsQueryResponse schema."""
        resp = self.client.get("/api/v1/admin/logs?limit=50", headers=self.auth_headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("count", data)
        self.assertIn("filters", data)
        self.assertIn("logs", data)

    def test_checkout_validation_idor_protection(self):
        """Verify /checkout rejects invalid guild_id and enforces integer snowflake validation."""
        # Invalid string guild_id
        resp = self.client.get("/checkout?guild_id=invalid_snowflake&tier=1")
        self.assertEqual(resp.status_code, 422)

        # Too small / out of range guild_id
        resp_small = self.client.get("/checkout?guild_id=123&tier=1")
        self.assertEqual(resp_small.status_code, 422)

    def test_prometheus_metrics_endpoint_auth(self):
        """Verify /metrics requires auth and accepts both X-Webhook-Secret and Bearer token."""
        # Unauthorized without headers
        resp_unauth = self.client.get("/metrics")
        self.assertEqual(resp_unauth.status_code, 401)

        # Authorized with X-Webhook-Secret
        resp_secret = self.client.get("/metrics", headers=self.auth_headers)
        self.assertEqual(resp_secret.status_code, 200)
        self.assertIn("process_uptime_seconds", resp_secret.text)

        # Authorized with Authorization: Bearer <secret>
        bearer_headers = {"Authorization": "Bearer test_secret_123"}
        resp_bearer = self.client.get("/metrics", headers=bearer_headers)
        self.assertEqual(resp_bearer.status_code, 200)
        self.assertIn("process_uptime_seconds", resp_bearer.text)

if __name__ == "__main__":
    unittest.main()
