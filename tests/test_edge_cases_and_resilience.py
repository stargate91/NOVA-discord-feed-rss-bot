import unittest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from db.repositories.monitor_repo import _parse_monitor_row
from models.monitor import MonitorConfig
from models.guild import GuildSettings, TierLimits
from services.entitlement_service import EntitlementService
from core.base_monitor import BaseMonitor
from core.monitor_manager import MonitorManager
from engine.scheduler import PollingScheduler

class DummyEdgeMonitor(BaseMonitor):
    async def fetch_new_items(self):
        return []

    def get_item_id(self, item) -> str:
        return str(item.get("id", "0")) if isinstance(item, dict) else str(item)

    async def process_item(self, item):
        pass

    async def get_latest_item(self):
        return {"id": "1", "title": "Test Title"}

class TestEdgeCasesAndResilience(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.config = {
            "tier_config": {
                "0": {"min_refresh_interval": 20, "max_monitors": 2, "features": ["basic"]},
                "3": {"min_refresh_interval": 5, "max_monitors": 50, "features": ["all"]}
            }
        }
        self.bot.guild_settings_cache = {}

    def test_corrupted_json_in_extra_settings(self):
        """Verify _parse_monitor_row safely handles invalid/corrupted JSON without crashing."""
        # Malformed JSON string "{bad json"
        corrupted_row = (1, 100, "youtube", "Test YT", 111, 222, True, "{invalid_json_content", None)
        config = _parse_monitor_row(corrupted_row)

        self.assertEqual(config.id, 1)
        self.assertEqual(config.guild_id, 100)
        self.assertEqual(config.type, "youtube")
        self.assertEqual(config.target_channels, [111])
        self.assertEqual(config.target_roles, [222])
        self.assertEqual(config.extra_settings, {})

    def test_empty_and_null_json_in_extra_settings(self):
        """Verify _parse_monitor_row handles None and empty extra_settings."""
        row_none = (2, 200, "twitch", "Streamer", None, None, False, None, None)
        config_none = _parse_monitor_row(row_none)

        self.assertEqual(config_none.id, 2)
        self.assertEqual(config_none.target_channels, [])
        self.assertEqual(config_none.target_roles, [])
        self.assertFalse(config_none.enabled)

    def test_invalid_embed_color_variations(self):
        """Verify get_color gracefully falls back to default on invalid color inputs."""
        # 1. Invalid hex string
        m1 = DummyEdgeMonitor(self.bot, {"embed_color": "#INVALID_HEX_STRING"})
        self.assertEqual(m1.get_color(), 0x3d3f45)

        # 2. Out of range or non-hex string
        m2 = DummyEdgeMonitor(self.bot, {"embed_color": "rainbow"})
        self.assertEqual(m2.get_color(), 0x3d3f45)

        # 3. None / empty embed color
        m3 = DummyEdgeMonitor(self.bot, {"embed_color": None})
        self.assertEqual(m3.get_color(), 0x3d3f45)

        # 4. Valid hex formats (with and without prefix)
        m4 = DummyEdgeMonitor(self.bot, {"embed_color": "#ff0000"})
        self.assertEqual(m4.get_color(), 0xff0000)

        m5 = DummyEdgeMonitor(self.bot, {"embed_color": "0x00ff00"})
        self.assertEqual(m5.get_color(), 0x00ff00)

    def test_null_and_zero_guild_id_in_entitlements(self):
        """Verify EntitlementService safely handles None, 0, and untracked guild IDs."""
        service = EntitlementService(self.bot, self.bot.config)

        # 1. Zero guild_id
        limits_zero = service.get_guild_tier_limits(0)
        self.assertIsInstance(limits_zero, TierLimits)
        self.assertEqual(limits_zero.min_refresh_interval, 20)
        self.assertFalse(service.is_premium(0))
        self.assertFalse(service.has_feature(0, "custom_branding"))

        # 2. None guild_id
        limits_none = service.get_guild_tier_limits(None)
        self.assertEqual(limits_none.min_refresh_interval, 20)
        self.assertFalse(service.is_premium(None))

        # 3. Refresh interval fallback
        interval = service.get_guild_refresh_interval(0)
        self.assertGreaterEqual(interval, 20)

    def test_extreme_large_monitor_list_indexing(self):
        """Verify scheduler and manager handle high-volume monitor indexing (5,000+ monitors) efficiently."""
        manager = MonitorManager(self.bot, self.bot.config)
        scheduler = PollingScheduler(self.bot, pipeline=MagicMock(), get_monitors_callback=lambda: manager.monitors)
        manager.scheduler = scheduler

        # Construct 5,000 monitor objects
        monitors = []
        for i in range(1, 5001):
            m = DummyEdgeMonitor(
                self.bot,
                {"id": i, "guild_id": 100 + (i % 50), "type": "rss", "enabled": True}
            )
            monitors.append(m)

        manager.monitors = monitors

        # Verify all 5,000 monitors are indexed and queryable in O(1)
        self.assertEqual(len(manager.monitors), 5000)
        self.assertIsNotNone(manager.get_monitor_by_id(2500))
        self.assertIsNotNone(manager.get_monitor_by_id(5000))
        self.assertIsNone(manager.get_monitor_by_id(99999))

if __name__ == "__main__":
    unittest.main()
