import unittest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch
from models import (
    DomainModel,
    GuildSettings,
    TierLimits,
    MonitorConfig,
    PaymentHistoryRecord,
    RedeemResult,
    BotStatus,
    YouTubeCacheItem,
)
from db import guild_repo, monitor_repo, billing_repo, bot_settings_repo, cache_repo

class TestDomainModels(unittest.TestCase):
    def test_domain_model_dict_compatibility(self):
        """Verify DomainModel supports both attribute access and dict indexing/get."""
        class SampleModel(DomainModel):
            id: int
            name: str
            tags: list[str] = []

        sample = SampleModel(id=42, name="Test Item", custom_field="extra_value")

        # Attribute access
        self.assertEqual(sample.id, 42)
        self.assertEqual(sample.name, "Test Item")

        # Dict indexing
        self.assertEqual(sample["id"], 42)
        self.assertEqual(sample["name"], "Test Item")

        # Dict .get()
        self.assertEqual(sample.get("id"), 42)
        self.assertEqual(sample.get("custom_field"), "extra_value")
        self.assertEqual(sample.get("non_existent", "default_val"), "default_val")

        # Dict membership
        self.assertIn("id", sample)
        self.assertIn("custom_field", sample)
        self.assertNotIn("non_existent", sample)

        # Mutation via dict setter
        sample["name"] = "Updated Name"
        self.assertEqual(sample.name, "Updated Name")

    def test_guild_settings_model(self):
        """Verify GuildSettings defaults, properties, and serialization."""
        settings = GuildSettings(guild_id=123, language="hu", tier=2)
        self.assertEqual(settings.guild_id, 123)
        self.assertEqual(settings.language, "hu")
        self.assertEqual(settings.tier, 2)
        self.assertTrue(settings.has_active_premium)

        # Expired premium test
        expired = GuildSettings(
            guild_id=456,
            tier=0,
            is_master=False,
            premium_until=datetime.now() - timedelta(days=1)
        )
        self.assertFalse(expired.has_active_premium)

        # Active future premium test
        active = GuildSettings(
            guild_id=789,
            tier=0,
            is_master=False,
            premium_until=datetime.now() + timedelta(days=10)
        )
        self.assertTrue(active.has_active_premium)

    def test_tier_limits_unpacking(self):
        """Verify TierLimits can be accessed via attributes or unpacked as a 5-tuple."""
        limits = TierLimits(
            min_refresh_interval=5,
            max_monitors=10,
            max_channels=3,
            max_pings=2,
            max_purge=50
        )
        self.assertEqual(limits.min_refresh_interval, 5)
        self.assertEqual(limits.max_monitors, 10)

        # Unpacking as 5-tuple (used in entitlement service callers)
        min_ri, max_m, max_ch, max_p, max_pu = limits
        self.assertEqual(min_ri, 5)
        self.assertEqual(max_m, 10)
        self.assertEqual(max_ch, 3)
        self.assertEqual(max_p, 2)
        self.assertEqual(max_pu, 50)

    def test_monitor_config_model(self):
        """Verify MonitorConfig fields and platform alias property."""
        config = MonitorConfig(
            id=10,
            guild_id=999,
            type="youtube",
            name="My Channel",
            target_channels=[123456],
            target_roles=[789012]
        )
        self.assertEqual(config.id, 10)
        self.assertEqual(config.platform, "youtube")
        self.assertEqual(config.type, "youtube")
        self.assertEqual(config["target_channels"], [123456])

    def test_redeem_result_unpacking(self):
        """Verify RedeemResult can be used as a domain model and unpacked as a 2-tuple."""
        res = RedeemResult(success=True, message="Redeemed!", duration_days=30, tier=2)
        self.assertTrue(res.success)
        self.assertEqual(res.duration_days, 30)

        # Tuple unpacking
        success, msg = res
        self.assertTrue(success)
        self.assertEqual(msg, "Redeemed!")

class TestRepositoriesDomainTyping(unittest.IsolatedAsyncioTestCase):
    async def test_guild_repo_returns_guild_settings(self):
        """Verify guild_repo.get_guild_settings returns a typed GuildSettings instance."""
        mock_row = ("hu", 12345, '{"youtube": "Alert!"}', None, 15, 2, "sub_1", "Branding Text", True, False, True)
        with patch("db.repositories.guild_repo._fetchrow", new_callable=AsyncMock) as mock_fetchrow:
            mock_fetchrow.return_value = mock_row
            settings = await guild_repo.get_guild_settings(100)
            self.assertIsInstance(settings, GuildSettings)
            self.assertEqual(settings.guild_id, 100)
            self.assertEqual(settings.language, "hu")
            self.assertEqual(settings.tier, 2)
            self.assertEqual(settings.alert_templates.get("youtube"), "Alert!")

    async def test_monitor_repo_returns_monitor_configs(self):
        """Verify monitor_repo.get_all_monitors returns typed MonitorConfig instances."""
        mock_rows = [
            (1, 100, "youtube", "YT 1", 111, 222, 1, '{"channel_id": "UC123"}', None),
            (2, 200, "twitch", "TW 1", 333, 444, 1, '{"username": "streamer"}', None),
        ]
        with patch("db.repositories.monitor_repo._fetch", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = mock_rows
            monitors = await monitor_repo.get_all_monitors()
            self.assertEqual(len(monitors), 2)
            self.assertIsInstance(monitors[0], MonitorConfig)
            self.assertEqual(monitors[0].id, 1)
            self.assertEqual(monitors[0].platform, "youtube")
            self.assertIsInstance(monitors[1], MonitorConfig)
            self.assertEqual(monitors[1].platform, "twitch")

    async def test_billing_repo_returns_payment_history_records(self):
        """Verify billing_repo.get_payment_history returns typed PaymentHistoryRecord instances."""
        now = datetime.now()
        mock_rows = [(1, "sess_123", "price_abc", 500, "usd", "completed", now)]
        with patch("db.repositories.billing_repo._fetch", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = mock_rows
            history = await billing_repo.get_payment_history(100)
            self.assertEqual(len(history), 1)
            self.assertIsInstance(history[0], PaymentHistoryRecord)
            self.assertEqual(history[0].stripe_session_id, "sess_123")
            self.assertEqual(history[0].amount_cents, 500)

    async def test_bot_settings_repo_returns_bot_statuses(self):
        """Verify bot_settings_repo.get_bot_statuses returns typed BotStatus instances."""
        mock_rows = [(1, "playing", "Managing feeds"), (2, "watching", "YouTube")]
        with patch("db.repositories.bot_settings_repo._fetch", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = mock_rows
            statuses = await bot_settings_repo.get_bot_statuses()
            self.assertEqual(len(statuses), 2)
            self.assertIsInstance(statuses[0], BotStatus)
            self.assertEqual(statuses[0].type, "playing")
            self.assertEqual(statuses[0].text, "Managing feeds")

    async def test_cache_repo_returns_youtube_cache_item(self):
        """Verify cache_repo.get_youtube_cached_id returns typed YouTubeCacheItem."""
        mock_row = ("UC_TEST_ID", "Test Channel", "https://img.jpg")
        with patch("db.repositories.cache_repo._fetchrow", new_callable=AsyncMock) as mock_fetchrow:
            mock_fetchrow.return_value = mock_row
            item = await cache_repo.get_youtube_cached_id("test query")
            self.assertIsInstance(item, YouTubeCacheItem)
            self.assertEqual(item.channel_id, "UC_TEST_ID")
            self.assertEqual(item.title, "Test Channel")

if __name__ == "__main__":
    unittest.main()
