import unittest
from unittest.mock import MagicMock
from core.monitor_factory import MonitorFactory
from monitors.youtube_monitor import YouTubeMonitor
from monitors.rss_monitor import RSSMonitor
from monitors.steam_news_monitor import SteamNewsMonitor
from monitors.steam_free_monitor import SteamFreeMonitor
from monitors.gog_free_monitor import GOGFreeMonitor
from monitors.epic_games_monitor import EpicGamesMonitor
from monitors.movie_monitor import MovieMonitor
from monitors.tv_series_monitor import TVSeriesMonitor
from monitors.stream_monitor import TwitchMonitor, KickMonitor
from monitors.crypto_monitor import CryptoMonitor
from monitors.github_monitor import GitHubMonitor

class TestMonitorFactory(unittest.TestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.has_feature.return_value = True

    def test_create_all_known_monitor_types(self):
        """Verify that factory instantiates correct monitor class for every supported platform."""
        test_cases = [
            ({"id": 1, "type": "youtube", "channel_id": "UC123"}, YouTubeMonitor),
            ({"id": 2, "type": "rss", "feed_url": "https://example.com/feed.xml"}, RSSMonitor),
            ({"id": 3, "type": "steam_news", "app_id": 730}, SteamNewsMonitor),
            ({"id": 4, "type": "steam_free"}, SteamFreeMonitor),
            ({"id": 5, "type": "gog_free"}, GOGFreeMonitor),
            ({"id": 6, "type": "epic_games"}, EpicGamesMonitor),
            ({"id": 7, "type": "movie"}, MovieMonitor),
            ({"id": 8, "type": "tv_series"}, TVSeriesMonitor),
            ({"id": 9, "type": "twitch", "channel_name": "shroud"}, TwitchMonitor),
            ({"id": 10, "type": "kick", "channel_name": "xqc"}, KickMonitor),
            ({"id": 11, "type": "crypto", "symbol": "BTC"}, CryptoMonitor),
            ({"id": 12, "type": "github", "repo_path": "torvalds/linux"}, GitHubMonitor),
        ]

        for config, expected_class in test_cases:
            instance = MonitorFactory.create(self.bot, config)
            self.assertIsNotNone(instance, f"Factory failed to create instance for type '{config['type']}'")
            self.assertIsInstance(instance, expected_class, f"Factory returned wrong class for type '{config['type']}'")

    def test_case_insensitivity(self):
        """Verify platform types are resolved in a case-insensitive manner with whitespace trimming."""
        config = {"id": 1, "type": "  YoUtUbE  ", "channel_id": "UC123"}
        instance = MonitorFactory.create(self.bot, config)
        self.assertIsInstance(instance, YouTubeMonitor)

    def test_crypto_entitlement_gating(self):
        """Verify crypto monitor returns None if guild has no entitlement."""
        self.bot.has_feature.return_value = False
        config = {"id": 1, "type": "crypto", "guild_id": 12345}
        instance = MonitorFactory.create(self.bot, config)
        self.assertIsNone(instance)

        self.bot.has_feature.return_value = True
        instance_allowed = MonitorFactory.create(self.bot, config)
        self.assertIsInstance(instance_allowed, CryptoMonitor)

    def test_dynamic_registration_and_unregistration(self):
        """Verify custom monitor types can be registered and unregistered dynamically."""
        dummy_created = []

        @MonitorFactory.register("custom_feed")
        def custom_factory(bot, config):
            dummy_created.append((bot, config))
            return MagicMock(name="CustomMonitor")

        self.assertTrue(MonitorFactory.is_registered("custom_feed"))
        self.assertIn("custom_feed", MonitorFactory.registered_types())

        cfg = {"id": 99, "type": "custom_feed", "custom_key": "val"}
        instance = MonitorFactory.create(self.bot, cfg)
        self.assertIsNotNone(instance)
        self.assertEqual(len(dummy_created), 1)

        # Cleanup / unregister
        MonitorFactory.unregister("custom_feed")
        self.assertFalse(MonitorFactory.is_registered("custom_feed"))
        self.assertIsNone(MonitorFactory.create(self.bot, cfg))

    def test_create_unknown_monitor_type_returns_none(self):
        """Verify that unknown/unsupported platform types gracefully return None."""
        config = {"id": 999, "type": "unsupported_unknown_platform"}
        instance = MonitorFactory.create(self.bot, config)
        self.assertIsNone(instance)

    def test_invalid_config_format(self):
        """Verify non-dict configs return None safely."""
        self.assertIsNone(MonitorFactory.create(self.bot, None))
        self.assertIsNone(MonitorFactory.create(self.bot, "not a dict"))
        self.assertIsNone(MonitorFactory.create(self.bot, {}))

if __name__ == "__main__":
    unittest.main()
