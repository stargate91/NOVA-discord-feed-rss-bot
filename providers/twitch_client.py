from clients import http_client
from logger import log

class TwitchClient:
    """Provider client for Twitch Helix API and OAuth2 token management."""

    def __init__(self, client_id: str | None = None, client_secret: str | None = None, cache=None):
        self.client_id = client_id
        self.client_secret = client_secret
        self.cache = cache
        self._local_token: str | None = None

    async def get_token(self) -> str | None:
        """Get cached Twitch App Access Token or request a new one."""
        cache_key = "twitch_app_token"
        if self.cache and hasattr(self.cache, "get_shared_data"):
            token = self.cache.get_shared_data(cache_key, max_age_seconds=86400)
            if token:
                return token

        if self._local_token:
            return self._local_token

        if not self.client_id or not self.client_secret:
            log.error("[TwitchClient] Missing client_id or client_secret.")
            return None

        url = "https://id.twitch.tv/oauth2/token"
        params = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        }

        try:
            data = await http_client.get_json(url, params=params)
            if data and isinstance(data, dict):
                token = data.get("access_token")
                if token:
                    if self.cache and hasattr(self.cache, "set_shared_data"):
                        self.cache.set_shared_data(cache_key, token)
                    self._local_token = token
                    return token
        except Exception as e:
            log.error(f"[TwitchClient] Error fetching token: {e}")
        return None

    async def fetch_stream(self, username: str) -> dict | None:
        """Fetch stream status and profile info for a Twitch channel."""
        token = await self.get_token()
        if not token or not self.client_id:
            return None

        url = f"https://api.twitch.tv/helix/streams?user_login={username}"
        headers = {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {token}"
        }

        try:
            data = await http_client.get_json(url, headers=headers)
            if not data or not isinstance(data, dict):
                return None

            streams = data.get("data", [])
            if not streams:
                return {"is_live": False}

            stream = streams[0]
            user_id = stream.get("user_id")
            profile_image = ""

            if user_id:
                user_url = f"https://api.twitch.tv/helix/users?id={user_id}"
                user_data = await http_client.get_json(user_url, headers=headers)
                if user_data and isinstance(user_data, dict) and user_data.get("data"):
                    profile_image = user_data["data"][0].get("profile_image_url", "")

            thumbnail = stream.get("thumbnail_url", "").replace("{width}", "1280").replace("{height}", "720")

            return {
                "is_live": True,
                "title": stream.get("title", ""),
                "game": stream.get("game_name", ""),
                "viewers": stream.get("viewer_count", 0),
                "thumbnail": thumbnail,
                "display_name": stream.get("user_name", username),
                "profile_image": profile_image,
                "url": f"https://twitch.tv/{username}"
            }
        except Exception as e:
            log.error(f"[TwitchClient] Error fetching stream for {username}: {e}")
            return None
