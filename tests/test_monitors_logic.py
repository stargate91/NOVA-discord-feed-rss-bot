import unittest
import time
from unittest.mock import MagicMock, AsyncMock, patch
from monitors.youtube_monitor import YouTubeMonitor
from monitors.epic_games_monitor import EpicGamesMonitor
from monitors.movie_monitor import MovieMonitor

class TestMonitorsLogic(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.config = {"tmdb_bearer_token": "dummy_token"}
        self.bot.monitor_manager = None

    # --- YouTube Monitor Tests ---
    def test_youtube_video_id_extraction(self):
        """Verify video ID extraction with and without yt:video: prefix."""
        monitor = YouTubeMonitor(self.bot, {"id": 1, "channel_id": "UC12345678901234567890123"})
        self.assertEqual(monitor.get_item_id({"id": "yt:video:abcXYZ123"}), "abcXYZ123")
        self.assertEqual(monitor.get_item_id({"id": "abcXYZ123"}), "abcXYZ123")

    async def test_youtube_old_video_skipped(self):
        """Verify that videos published more than 24 hours ago are skipped."""
        monitor = YouTubeMonitor(self.bot, {"id": 1, "channel_id": "UC12345678901234567890123"})
        monitor.send_update = AsyncMock()

        # 48 hours ago
        old_ts = int(time.time()) - (48 * 3600)
        entry = {
            "id": "yt:video:old_vid",
            "title": "Ancient Video",
            "published_ts": old_ts
        }
        await monitor.process_item(entry)
        monitor.send_update.assert_not_called()

    # --- Epic Games Monitor Tests ---
    async def test_epic_games_100_percent_free_filtering(self):
        """Verify that only 100% free promotions are considered active candidates."""
        monitor = EpicGamesMonitor(self.bot, {"id": 2, "include_upcoming": False})

        mock_data = [
            # 1. Truly free game (discountPercentage == 0 and discountPrice == 0)
            {
                "id": "free_game_1",
                "title": "Totally Free Game",
                "price": {"totalPrice": {"discountPrice": 0}},
                "promotions": {
                    "promotionalOffers": [{
                        "promotionalOffers": [{
                            "discountSetting": {"discountPercentage": 0},
                            "startDate": "2026-08-01T00:00:00.000Z",
                            "endDate": "2026-08-08T00:00:00.000Z"
                        }]
                    }]
                }
            },
            # 2. Paid / Discounted game (e.g. 50% off, discountPrice > 0)
            {
                "id": "paid_game_2",
                "title": "50% Off Game",
                "price": {"totalPrice": {"discountPrice": 1499}},
                "promotions": {
                    "promotionalOffers": [{
                        "promotionalOffers": [{
                            "discountSetting": {"discountPercentage": 50},
                            "startDate": "2026-08-01T00:00:00.000Z",
                            "endDate": "2026-08-08T00:00:00.000Z"
                        }]
                    }]
                }
            }
        ]

        monitor.client.fetch_promotions = AsyncMock(return_value=mock_data)
        items = await monitor.fetch_new_items()

        self.assertEqual(len(items), 1)
        self.assertEqual(monitor.get_item_id(items[0]), "free_game_1_active")

    # --- Movie Monitor Tests ---
    def test_movie_genre_and_score_formatting(self):
        """Verify TMDB genre mapping and vote rating string formatting."""
        monitor = MovieMonitor(self.bot, {"id": 3})
        genre_map = {28: "Action", 12: "Adventure", 878: "Sci-Fi"}

        movie_raw = {
            "id": 550,
            "title": "Fight Club",
            "overview": "An insomniac office worker...",
            "release_date": "1999-10-15",
            "genre_ids": [28, 878],
            "vote_average": 8.433,
            "vote_count": 26000,
            "poster_path": "/poster.jpg",
            "backdrop_path": "/backdrop.jpg"
        }

        data = monitor._build_tmdb_data(movie_raw, genre_map)
        self.assertEqual(data["title"], "Fight Club")
        self.assertEqual(data["genre_text"], "Action, Sci-Fi")
        self.assertEqual(data["score_text"], "8.4 (26000)")
        self.assertEqual(data["poster_url"], "https://image.tmdb.org/t/p/w500/poster.jpg")
        self.assertEqual(data["backdrop_url"], "https://image.tmdb.org/t/p/w780/backdrop.jpg")

if __name__ == "__main__":
    unittest.main()
