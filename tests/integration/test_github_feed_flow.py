import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from monitors.github_monitor import GitHubMonitor
from engine.pipeline import FeedPipeline
from engine.cache import SharedDataCache

class TestGitHubFeedFlowIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.config = {"github_token": "ghp_mock_token_123"}
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.guild_settings_cache = {100: {}}

        self.cache = SharedDataCache(max_size=500)
        self.bot.monitor_manager = MagicMock()
        self.bot.monitor_manager.cache = self.cache
        self.bot.monitor_manager.get_shared_data.side_effect = self.cache.get_shared_data
        self.bot.monitor_manager.set_shared_data.side_effect = self.cache.set_shared_data

        self.pipeline = FeedPipeline(self.bot)

    async def test_github_releases_pipeline_end_to_end(self):
        """Test full GitHub release ingestion: API fetch -> Shared Cache -> DB Deduplication -> Discord Embed/View -> Commit."""
        monitor_config = {
            "id": 77,
            "guild_id": 100,
            "repo": "discord/discord-api-docs",
            "name": "Discord API Releases",
            "target_channels": [987654]
        }
        monitor = GitHubMonitor(self.bot, monitor_config)
        monitor.is_first_run = False
        monitor.send_update = AsyncMock()

        raw_releases = [
            {
                "id": 1001,
                "tag_name": "v10.0.0",
                "name": "Discord API v10 Released",
                "body": "Detailed changelog for API v10.",
                "html_url": "https://github.com/discord/discord-api-docs/releases/tag/v10.0.0",
                "author": {"login": "discord-bot", "avatar_url": "https://github.com/avatar.png"},
                "published_at": "2026-08-20T10:00:00Z"
            },
            {
                "id": 1002,
                "tag_name": "v10.1.0",
                "name": "Discord API v10.1 Maintenance Release",
                "body": "Minor bugfixes and performance improvements.",
                "html_url": "https://github.com/discord/discord-api-docs/releases/tag/v10.1.0",
                "author": {"login": "discord-bot", "avatar_url": "https://github.com/avatar.png"},
                "published_at": "2026-08-25T10:00:00Z"
            }
        ]
        monitor.fetch_releases = AsyncMock(return_value=raw_releases)

        # Database state: Release 1001 is already published, 1002 is brand new
        published_db_set = {"1001"}

        async def mock_get_bulk(ids, platform, guild_id):
            return published_db_set.intersection(ids)

        async def mock_mark_bulk(records):
            for r in records:
                published_db_set.add(r["entry_id"])

        with patch("db.monitor_repo.get_published_ids_bulk", side_effect=mock_get_bulk), \
             patch("db.monitor_repo.mark_as_published_bulk", side_effect=mock_mark_bulk):

            # --- RUN 1: Process unshared monitor ---
            await self.pipeline.process_unshared(monitor)

            # 1. Verify only Release 1002 was posted to Discord
            self.assertEqual(monitor.send_update.call_count, 1)
            call_kwargs = monitor.send_update.call_args[1]
            self.assertIn("view", call_kwargs)
            self.assertIsNotNone(call_kwargs["view"])

            # 2. Verify Release 1002 is committed to DB
            self.assertIn("1002", published_db_set)

            # --- RUN 2: Next polling tick ---
            monitor.send_update.reset_mock()
            await self.pipeline.process_unshared(monitor)

            # 3. Exactly 0 duplicate alerts sent
            monitor.send_update.assert_not_called()

if __name__ == "__main__":
    unittest.main()
