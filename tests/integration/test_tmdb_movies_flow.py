import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from monitors.movie_monitor import MovieMonitor
from engine.pipeline import FeedPipeline
from engine.cache import SharedDataCache

class TestTMDBMoviesFlowIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.config = {
            "tmdb_bearer_token": "mock_tmdb_token_xyz",
            "tmdb_api_key": "mock_tmdb_key_123"
        }
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: "hu-HU" if k == "tmdb_lang_code" else k
        self.bot.guild_settings_cache = {100: {}}

        self.cache = SharedDataCache(max_size=500)
        self.bot.monitor_manager = MagicMock()
        self.bot.monitor_manager.cache = self.cache
        self.bot.monitor_manager.get_shared_data.side_effect = self.cache.get_shared_data
        self.bot.monitor_manager.set_shared_data.side_effect = self.cache.set_shared_data

        self.pipeline = FeedPipeline(self.bot)

    async def test_tmdb_movies_pipeline_end_to_end(self):
        """Test full TMDB movie flow: Discovery -> Genre Map resolution -> Components V2 formatting -> DB Commit -> 0 duplicates on tick 2."""
        monitor_config = {
            "id": 99,
            "guild_id": 100,
            "name": "Cinema Premieres",
            "target_channels": [123456]
        }
        monitor = MovieMonitor(self.bot, monitor_config)
        monitor.is_first_run = False
        monitor.send_update = AsyncMock()

        # Mock TMDB genres
        monitor.tmdb_client.get_movie_genres = AsyncMock(return_value={
            28: "Akció",
            878: "Sci-Fi"
        })

        # Mock TMDB Now Playing response
        raw_movies = [
            {
                "id": 801,
                "title": "Interstellar Odyssey",
                "overview": "A voyage across dimensions.",
                "release_date": "2026-09-01",
                "genre_ids": [28, 878],
                "vote_average": 8.7,
                "vote_count": 4500,
                "poster_path": "/poster_interstellar.jpg"
            },
            {
                "id": 802,
                "title": "Cybernetic City",
                "overview": "Life in 2099.",
                "release_date": "2026-09-05",
                "genre_ids": [878],
                "vote_average": 7.4,
                "vote_count": 1200,
                "poster_path": "/poster_cyber.jpg"
            }
        ]
        monitor.tmdb_client.fetch_now_playing_movies = AsyncMock(return_value=raw_movies)

        # Database state: Movie 801 is published, Movie 802 is brand new
        published_db_set = {"801"}

        async def mock_get_bulk(ids, platform, guild_id):
            return published_db_set.intersection(ids)

        async def mock_mark_bulk(records):
            for r in records:
                published_db_set.add(r["entry_id"])

        with patch("db.monitor_repo.get_published_ids_bulk", side_effect=mock_get_bulk), \
             patch("db.monitor_repo.mark_as_published_bulk", side_effect=mock_mark_bulk):

            # --- RUN 1: Process unshared monitor ---
            await self.pipeline.process_unshared(monitor)

            # 1. Verify only Movie 802 was posted to Discord
            self.assertEqual(monitor.send_update.call_count, 1)
            call_kwargs = monitor.send_update.call_args[1]
            self.assertIn("view", call_kwargs)
            self.assertIsNotNone(call_kwargs["view"])

            # 2. Verify Movie 802 is committed to DB
            self.assertIn("802", published_db_set)

            # --- RUN 2: Next polling tick ---
            monitor.send_update.reset_mock()
            await self.pipeline.process_unshared(monitor)

            # 3. Exactly 0 duplicate alerts sent
            monitor.send_update.assert_not_called()

if __name__ == "__main__":
    unittest.main()
