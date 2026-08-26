import os
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from starlette.testclient import TestClient
from core.webhook_server import app, setup_webhook_bot
from core.bot import FeedBot

class TestGuildLifecycleAndPermissionsFlowIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        os.environ["WEBHOOK_SECRET"] = "auth_sec_999"
        self.bot_config = {
            "token": "dummy_token",
            "webhook_secret": "auth_sec_999",
            "master_guilds": {"9999": 0},
            "master_users": [777],
            "tier_config": {
                "0": {"name": "Free Tier", "features": ["basic"], "max_monitors": 3},
                "2": {"name": "Silver Tier", "features": ["basic", "custom_branding"], "max_monitors": 15},
                "3": {"name": "Gold Tier", "features": ["all"], "max_monitors": 50}
            }
        }
        self.bot = FeedBot(self.bot_config)
        self.bot.is_premium = MagicMock(return_value=False)

        setup_webhook_bot(self.bot)
        self.client = TestClient(app)

    def tearDown(self):
        os.environ.pop("WEBHOOK_SECRET", None)

    async def test_guild_join_lifecycle_and_permissions_api(self):
        """Test on_guild_join registers guild in DB & cache, then GET /guilds/{id}/permissions/{user} returns accurate permissions."""
        mock_guild = MagicMock()
        mock_guild.id = 5001
        mock_guild.name = "Awesome Discord Server"

        # 1. Simulate on_guild_join event
        with patch("db.guild_repo.ensure_guild_active", new_callable=AsyncMock) as mock_ensure:
            await self.bot.on_guild_join(mock_guild)
            mock_ensure.assert_called_once_with(5001)

        # 2. Verify cache was seeded with default values
        self.assertIn(5001, self.bot.guild_settings_cache)
        self.assertEqual(self.bot.guild_settings_cache[5001]["language"], "en")
        self.assertEqual(self.bot.guild_settings_cache[5001]["tier"], 0)

        # 3. Simulate Member with Admin permissions
        admin_member = MagicMock()
        admin_member.id = 12345
        admin_member.guild_permissions.administrator = True
        mock_guild.get_member.return_value = admin_member
        self.bot.get_guild = MagicMock(return_value=mock_guild)

        # 4. Web client requests user permissions
        headers = {"X-Webhook-Secret": "auth_sec_999"}
        resp = self.client.get("/guilds/5001/permissions/12345", headers=headers)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["is_admin"])
        self.assertEqual(data["tier"], 0)
        self.assertEqual(data["tier_name"], "Free Tier")
        self.assertIn("basic", data["features"])
        self.assertTrue(data["bot_in_guild"])

        # 5. Upgrade guild in cache to Tier 2 and verify permissions API updates immediately
        self.bot.guild_settings_cache[5001]["tier"] = 2
        resp2 = self.client.get("/guilds/5001/permissions/12345", headers=headers)
        data2 = resp2.json()
        self.assertEqual(data2["tier"], 2)
        self.assertEqual(data2["tier_name"], "Silver Tier")
        self.assertIn("custom_branding", data2["features"])

    async def test_guild_remove_lifecycle(self):
        """Test on_guild_remove deactivates guild in DB and purges cache."""
        mock_guild = MagicMock()
        mock_guild.id = 5002
        mock_guild.name = "Departing Server"
        self.bot.guild_settings_cache[5002] = {"tier": 1}

        with patch("db.guild_repo.set_guild_inactive", new_callable=AsyncMock) as mock_deact:
            await self.bot.on_guild_remove(mock_guild)
            mock_deact.assert_called_once_with(5002)
            self.assertNotIn(5002, self.bot.guild_settings_cache)

if __name__ == "__main__":
    unittest.main()
