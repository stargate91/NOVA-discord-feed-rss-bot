import unittest
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from services.entitlement_service import EntitlementService
from services.permission_service import PermissionService

class TestEntitlementsAndPermissions(unittest.TestCase):
    def setUp(self):
        self.mock_config = {
            "master_guilds": {"12345": "VIP Support Guild"},
            "master_user_ids": [999999],
            "tier_config": {
                "0": {"min_refresh_interval": 30, "max_monitors": 5, "max_channels": 1, "max_pings": 1, "max_purge": 50},
                "1": {"min_refresh_interval": 15, "max_monitors": 15, "max_channels": 3, "max_pings": 3, "max_purge": 100},
                "2": {"min_refresh_interval": 5, "max_monitors": 30, "max_channels": 5, "max_pings": 5, "max_purge": 200},
                "3": {"min_refresh_interval": 1, "max_monitors": 100, "max_channels": 10, "max_pings": 10, "max_purge": 500}
            }
        }
        self.bot = MagicMock()
        self.bot.config = self.mock_config
        self.bot.guild_settings_cache = {}

        self.entitlements = EntitlementService(self.bot, self.mock_config)
        self.permissions = PermissionService(self.bot, self.mock_config)

    def test_master_guild_is_premium(self):
        """Verify master guilds are permanently premium."""
        self.assertTrue(self.entitlements.is_master(12345))
        self.assertTrue(self.entitlements.is_premium(12345))

    def test_master_guild_has_unlimited_tier_limits(self):
        """Verify master guilds have zero limits and instant polling."""
        limits = self.entitlements.get_guild_tier_limits(12345)
        self.assertEqual(limits.min_refresh_interval, 0)
        self.assertEqual(limits.max_monitors, 999999)
        self.assertEqual(limits.max_channels, 999999)
        self.assertEqual(limits.max_pings, 999999)
        self.assertEqual(limits.max_purge, 999999)
        self.assertTrue(self.entitlements.has_feature(12345, "crypto_alerts"))
        self.assertTrue(self.entitlements.has_feature(12345, "unlimited"))

    def test_tier_based_premium_status(self):
        """Verify tier 1+ gives premium status."""
        self.bot.guild_settings_cache[100] = {"tier": 1}
        self.assertTrue(self.entitlements.is_premium(100))

        self.bot.guild_settings_cache[101] = {"tier": 0}
        self.assertFalse(self.entitlements.is_premium(101))

    def test_premium_until_expiration(self):
        """Verify legacy premium_until timestamp expiration."""
        # Active in future
        future_date = datetime.now() + timedelta(days=30)
        self.bot.guild_settings_cache[200] = {"tier": 0, "premium_until": future_date}
        self.assertTrue(self.entitlements.is_premium(200))

        # Expired in past
        past_date = datetime.now() - timedelta(days=1)
        self.bot.guild_settings_cache[201] = {"tier": 0, "premium_until": past_date}
        self.assertFalse(self.entitlements.is_premium(201))

    def test_guild_refresh_intervals_by_tier(self):
        """Verify tier-based polling intervals (30m, 15m, 5m, 1m)."""
        self.bot.guild_settings_cache[0] = {"tier": 0, "refresh_interval": 30}
        self.bot.guild_settings_cache[1] = {"tier": 1, "refresh_interval": 15}
        self.bot.guild_settings_cache[2] = {"tier": 2, "refresh_interval": 5}
        self.bot.guild_settings_cache[3] = {"tier": 3, "refresh_interval": 1}

        self.assertEqual(self.entitlements.get_guild_refresh_interval(0), 30)
        self.assertEqual(self.entitlements.get_guild_refresh_interval(1), 15)
        self.assertEqual(self.entitlements.get_guild_refresh_interval(2), 5)
        self.assertEqual(self.entitlements.get_guild_refresh_interval(3), 1)

    def test_master_user_is_admin(self):
        """Verify master user ID has full admin permissions."""
        user = MagicMock()
        user.id = 999999
        self.assertTrue(self.permissions.is_master_admin(user))

    def test_discord_administrator_is_bot_admin(self):
        """Verify member with Discord Administrator permission is bot admin."""
        member = MagicMock()
        member.id = 111111
        member.guild_permissions.administrator = True
        member.guild_permissions.manage_guild = True
        self.assertTrue(self.permissions.is_bot_admin(member))

if __name__ == "__main__":
    unittest.main()
