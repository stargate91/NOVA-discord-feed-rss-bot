from clients import http_client
from logger import log

class KickClient:
    """Provider client for Kick Public API and OAuth2 token management."""

    def __init__(self, client_id: str | None = None, client_secret: str | None = None, cache=None):
        self.client_id = client_id
        self.client_secret = client_secret
        self.cache = cache
        self._local_token: str | None = None

    async def get_token(self) -> str | None:
        """Get cached Kick App Access Token or request a new one."""
        cache_key = "kick_app_token"
        if self.cache and hasattr(self.cache, "get_shared_data"):
            token = self.cache.get_shared_data(cache_key, max_age_seconds=86400)
            if token:
                return token

        if self._local_token:
            return self._local_token

        if not self.client_id or not self.client_secret:
            log.error("[KickClient] Missing kick_client_id or kick_client_secret.")
            return None

        url = "https://id.kick.com/oauth/token"
        payload = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }

        try:
            session = await http_client.get_session()
            async with session.post(url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"}) as resp:
                if resp.status == 200:
                    resp_data = await resp.json()
                    token = resp_data.get("access_token")
                    if token:
                        if self.cache and hasattr(self.cache, "set_shared_data"):
                            self.cache.set_shared_data(cache_key, token)
                        self._local_token = token
                        return token
                else:
                    log.error(f"[KickClient] Token error: {resp.status} {await resp.text()}")
        except Exception as e:
            log.error(f"[KickClient] Error fetching token: {e}")
        return None

    async def fetch_stream(self, username: str) -> dict | None:
        """Fetch stream status and profile info for a Kick channel."""
        token = await self.get_token()
        if not token:
            return None

        url = f"https://api.kick.com/public/v1/channels?slug={username}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }

        try:
            data = await http_client.get_json(url, headers=headers)
            if not data or not isinstance(data, dict):
                return None

            channels = data.get("data", [])
            if not channels:
                return {"is_live": False}

            channel_data = channels[0]
            stream_data = channel_data.get("stream")

            if not stream_data or not stream_data.get("is_live"):
                return {"is_live": False}

            title = channel_data.get("stream_title", "")
            game = channel_data.get("category", {}).get("name", "")
            viewers = stream_data.get("viewer_count", 0)
            thumbnail = stream_data.get("thumbnail", "")
            profile_image = channel_data.get("banner_picture", "")
            display_name = channel_data.get("slug", username)

            if thumbnail and thumbnail.startswith("//"):
                thumbnail = f"https:{thumbnail}"
            if profile_image and profile_image.startswith("//"):
                profile_image = f"https:{profile_image}"

            return {
                "is_live": True,
                "title": title,
                "game": game,
                "viewers": viewers,
                "thumbnail": thumbnail,
                "display_name": display_name,
                "profile_image": profile_image,
                "url": f"https://kick.com/{username}"
            }
        except Exception as e:
            log.error(f"[KickClient] Error fetching stream for {username}: {e}")
            return None
