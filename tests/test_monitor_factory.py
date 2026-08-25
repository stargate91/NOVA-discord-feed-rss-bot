import unittest
from unittest.mock import MagicMock
from core.monitor_factory import create_monitor_instance
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
            instance = create_monitor_instance(self.bot, config)
            self.assertIsNotNone(instance, f"Factory failed to create instance for type '{config['type']}'")
            self.assertIsInstance(instance, expected_class, f"Factory returned wrong class for type '{config['type']}'")

    def test_create_unknown_monitor_type_returns_none(self):
        """Verify that unknown/unsupported platform types gracefully return None."""
        config = {"id": 999, "type": "unsupported_unknown_platform"}
        instance = create_monitor_instance(self.bot, config)
        self.assertIsNone(instance)

if __name__ == "__main__":
    unittest.main()
