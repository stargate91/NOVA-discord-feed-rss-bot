import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from providers.twitch_client import TwitchClient
from monitors.stream_monitor import TwitchMonitor
from engine.cache import SharedDataCache
from clients import http_client

class TestTwitchHelixStreamFlowIntegration(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.guild_settings_cache = {100: {}}

        self.cache = SharedDataCache(max_size=500)
        self.bot.monitor_manager = MagicMock()
        self.bot.monitor_manager.cache = self.cache
        self.bot.monitor_manager.get_shared_data.side_effect = self.cache.get_shared_data
        self.bot.monitor_manager.set_shared_data.side_effect = self.cache.set_shared_data

    async def test_twitch_oauth_token_caching_and_stream_lifecycle(self):
        """Test Twitch Helix token caching in SharedDataCache and full stream status lifecycle transitions."""
        # 1. Initialize TwitchClient with shared cache
        client = TwitchClient(
            client_id="mock_client_id_123",
            client_secret="mock_client_secret_456",
            cache=self.cache
        )

        # Mock token HTTP endpoint response on the http_client singleton
        with patch.object(http_client, "get_json", new_callable=AsyncMock) as mock_get_json:
            mock_get_json.return_value = {
                "access_token": "helix_oauth_token_999",
                "expires_in": 86400,
                "token_type": "bearer"
            }

            # First token request: should fetch over network
            token1 = await client.get_token()
            self.assertEqual(token1, "helix_oauth_token_999")
            self.assertEqual(mock_get_json.call_count, 1)

            # Second token request: should retrieve instantly from SharedDataCache
            token2 = await client.get_token()
            self.assertEqual(token2, "helix_oauth_token_999")
            # Network call count must NOT increase
            self.assertEqual(mock_get_json.call_count, 1)

        # 2. Setup StreamMonitor with Twitch platform
        monitor_config = {
            "id": 15,
            "guild_id": 100,
            "username": "shroud",
            "name": "Shroud Stream",
            "type": "twitch",
            "target_channels": [12345]
        }
        monitor = TwitchMonitor(self.bot, monitor_config)
        monitor.client = client
        monitor.is_first_run = False
        monitor.send_update = AsyncMock()

        # 3. Stream is OFFLINE initially
        monitor._fetch_platform_data = AsyncMock(return_value={
            "is_live": False,
            "username": "shroud"
        })
        await monitor.fetch_new_items()
        self.assertFalse(monitor.is_live)
        monitor.send_update.assert_not_called()

        # 4. Stream transitions to LIVE (Alert is dispatched and is_live becomes True)
        monitor._fetch_platform_data = AsyncMock(return_value={
            "is_live": True,
            "username": "shroud",
            "title": "Valorant Ranked with Friends",
            "game_name": "VALORANT",
            "viewers": 15400,
            "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_shroud.jpg"
        })
        # Clear cache so fresh platform data is processed
        self.cache._shared_cache.clear()
        with patch("db.monitor_repo.mark_as_published", new_callable=AsyncMock):
            await monitor.fetch_new_items()
            monitor.send_update.assert_called_once()
            self.assertTrue(monitor.is_live)

        # 5. Stream remains LIVE (No duplicate alert)
        monitor.send_update.reset_mock()
        self.cache._shared_cache.clear()
        await monitor.fetch_new_items()
        monitor.send_update.assert_not_called()
        self.assertTrue(monitor.is_live)

        # 6. Stream goes OFFLINE (Resets is_live state)
        monitor._fetch_platform_data = AsyncMock(return_value={
            "is_live": False,
            "username": "shroud"
        })
        self.cache._shared_cache.clear()
        await monitor.fetch_new_items()
        self.assertFalse(monitor.is_live)
        monitor.send_update.assert_not_called()

if __name__ == "__main__":
    unittest.main()
