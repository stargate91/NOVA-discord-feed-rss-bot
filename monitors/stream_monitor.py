import time
from core.base_monitor import BaseMonitor
from logger import log
from db import monitor_repo
from providers import TwitchClient, KickClient
from ui import generate_stream_layout

class BaseStreamMonitor(BaseMonitor):
    """Base class for stream platforms (Twitch, Kick)."""

    def __init__(self, bot, config):
        super().__init__(bot, config)
        raw_username = config.get("username", self.name)

        if raw_username:
            raw_username = raw_username.strip().rstrip('/')
            if 'kick.com/' in raw_username:
                raw_username = raw_username.split('kick.com/')[-1].split('?')[0]
            elif 'twitch.tv/' in raw_username:
                raw_username = raw_username.split('twitch.tv/')[-1].split('?')[0]

        self.stream_username = raw_username
        self.is_live = False

    def get_shared_key(self) -> str:
        return f"{self.platform}:{self.stream_username}"

    async def fetch_new_items(self) -> list[dict]:
        """Check if the stream is live."""
        if not self.stream_username:
            log.warning(f"No username for {self.platform} monitor: {self.name}")
            return []

        shared_data = None
        if self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
            shared_data = self.bot.monitor_manager.get_shared_data(self.get_shared_key())

        if shared_data:
            stream_data = shared_data
        else:
            try:
                stream_data = await self._fetch_platform_data()
                if stream_data and self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
                    self.bot.monitor_manager.set_shared_data(self.get_shared_key(), stream_data)
            except Exception as e:
                log.error(f"Error fetching {self.platform} data for {self.stream_username}: {e}")
                return []

        items = []
        current_live = stream_data.get("is_live", False) if stream_data else False

        if current_live and not self.is_live:
            if not getattr(self, 'is_silent_start', False):
                await self.process_item(stream_data)
            self.is_live = True
        elif not current_live and self.is_live:
            self.is_live = False

        self.is_silent_start = False
        self.is_first_run = False
        return items

    async def _fetch_platform_data(self) -> dict | None:
        raise NotImplementedError

    async def process_item(self, stream_data: dict):
        await self._send_live_notification(stream_data)

    def _build_stream_output(self, stream_data: dict) -> dict:
        """Build Components V2 layout from stream data. Returns (content, view) dict."""
        title = stream_data.get("title", self.bot.get_feedback(f"monitor_{self.platform}_fallback_title", guild_id=self.guild_id))
        na_text = self.bot.get_feedback("default_unknown", guild_id=self.guild_id)
        game = stream_data.get("game", na_text)
        viewers = stream_data.get("viewers", 0)
        thumbnail = stream_data.get("thumbnail", "")
        display_name = stream_data.get("display_name", self.stream_username)
        profile_image = stream_data.get("profile_image", "")
        stream_url = stream_data.get("url", "")

        if thumbnail:
            thumbnail = f"{thumbnail}?t={int(time.time())}"
        thumbnail = self.get_image_url(thumbnail)

        alert_text = self.get_alert_message({
            "name": display_name,
            "url": stream_url,
            "game": game,
            "title": title,
            "viewers": f"{viewers:,}",
            "platform": self.platform.capitalize()
        })

        content, layout = generate_stream_layout(
            bot=self.bot,
            guild_id=self.guild_id,
            alert_text=alert_text,
            display_name=display_name,
            title=title,
            url=stream_url,
            thumbnail_url=thumbnail,
            profile_image_url=profile_image,
            game=game,
            viewers=viewers,
            platform=self.platform,
            accent_color=self.get_color(0x3d3f45)
        )

        return {
            "content": content,
            "view": layout,
            "title": title,
            "display_name": display_name,
            "thumbnail": stream_data.get("thumbnail", ""),
            "stream_url": stream_url
        }

    async def _send_live_notification(self, stream_data: dict):
        """Send a Discord notification that the stream went live."""
        output = self._build_stream_output(stream_data)
        await self.send_update(content=output["content"], view=output["view"])

        try:
            await monitor_repo.mark_as_published(
                entry_id=f"{self.platform}:{self.stream_username}:{int(time.time())}",
                platform=self.platform,
                feed_url=output["stream_url"],
                guild_id=self.guild_id,
                title=output["title"],
                thumbnail_url=output["thumbnail"],
                author_name=output["display_name"]
            )
        except Exception as e:
            log.error(f"Failed to log stream notification: {e}")

    async def get_latest_item(self):
        """Fetch current stream status for manual check."""
        stream_data = await self._fetch_platform_data()
        if not stream_data or not stream_data.get("is_live"):
            return {"empty": True}

        output = self._build_stream_output(stream_data)
        return {"content": output["content"], "view": output["view"]}

    async def get_preview(self):
        """Provide a mock preview even if the streamer is offline."""
        item = await self.get_latest_item()
        if item and not item.get("empty"):
            return [item]

        mock_data = {
            "title": f"Mock Preview Alert for {self.stream_username}",
            "game": "Just Chatting",
            "viewers": 1234,
            "thumbnail": "",
            "display_name": self.stream_username,
            "profile_image": "",
            "url": f"https://{self.platform}.com/{self.stream_username}",
            "is_live": True
        }

        output = self._build_stream_output(mock_data)
        return [{"content": output["content"], "view": output["view"]}]


class TwitchMonitor(BaseStreamMonitor):
    def __init__(self, bot, config):
        super().__init__(bot, config)
        self.platform = "twitch"
        client_id = bot.config.get("twitch_client_id")
        client_secret = bot.config.get("twitch_client_secret")
        cache = bot.monitor_manager if hasattr(bot, "monitor_manager") else None
        self.client = TwitchClient(client_id=client_id, client_secret=client_secret, cache=cache)

    async def _fetch_platform_data(self) -> dict | None:
        return await self.client.fetch_stream(self.stream_username)


class KickMonitor(BaseStreamMonitor):
    def __init__(self, bot, config):
        super().__init__(bot, config)
        self.platform = "kick"
        client_id = bot.config.get("kick_client_id")
        client_secret = bot.config.get("kick_client_secret")
        cache = bot.monitor_manager if hasattr(bot, "monitor_manager") else None
        self.client = KickClient(client_id=client_id, client_secret=client_secret, cache=cache)

    async def _fetch_platform_data(self) -> dict | None:
        return await self.client.fetch_stream(self.stream_username)
