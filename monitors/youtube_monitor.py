import calendar
from datetime import datetime
from core.base_monitor import BaseMonitor
from logger import log
from db import monitor_repo
from providers import YouTubeClient
from clients import http_client
from ui import generate_youtube_layout

class YouTubeMonitor(BaseMonitor):
    """Monitor for YouTube video releases via RSS feed with API channel resolution."""

    def __init__(self, bot, config):
        super().__init__(bot, config)
        self.channel_id = config.get("channel_id")
        self.feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={self.channel_id}"
        self.is_resolving = False
        self.client = YouTubeClient()

    async def _ensure_channel_id(self) -> bool:
        """Helper to ensure we have a valid UCID, resolving handles/names if necessary."""
        if self.channel_id and self.channel_id.startswith("UC") and len(self.channel_id) == 24:
            return True

        if self.is_resolving:
            return False
        self.is_resolving = True

        log.info(f"Attempting to resolve YouTube Channel ID for: {self.channel_id}")
        resolved_data = await self.client.resolve_channel_id(self.channel_id)

        if resolved_data:
            ucid, title = resolved_data
            log.info(f"Successfully resolved '{self.channel_id}' to '{ucid}' (Title: {title})")

            if title == ucid or not title:
                count = sum(1 for m in self.bot.monitor_manager.monitors if m.guild_id == self.guild_id and m.platform == "youtube")
                title = f"YouTube #{count + 1}"

            should_update_id = not self.channel_id.startswith("UC") or len(self.channel_id) != 24

            if self.name.startswith("@") or self.name.startswith("UC") or self.name == self.channel_id or should_update_id:
                try:
                    if self.name != title:
                        await monitor_repo.update_monitor_name(self.id, title)
                        self.name = title
                        log.info(f"Updated monitor name to: {title}")

                    await monitor_repo.update_monitor_channel_id(self.id, ucid)
                    log.info(f"Updated monitor channel_id in DB to: {ucid}")
                except Exception as e:
                    log.error(f"Failed to update monitor in DB: {e}")

            self.channel_id = ucid
            self.feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={self.channel_id}"
            self.is_resolving = False
            return True

        log.warning(f"Could not resolve YouTube Channel ID for: {self.channel_id}")
        self.is_resolving = False
        return False

    def get_shared_key(self) -> str:
        return f"youtube:{self.channel_id}"

    async def fetch_new_items(self, force_fresh=False) -> list[dict]:
        """Fetch YouTube videos using RSS feed."""
        if not await self._ensure_channel_id():
            return []

        shared_key = self.get_shared_key()
        items = None
        if not force_fresh and self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
            items = self.bot.monitor_manager.get_shared_data(shared_key)

        if items is None:
            raw_entries = await self.client.fetch_channel_feed(self.channel_id)
            if raw_entries:
                items = []
                for entry in raw_entries:
                    pub_ts = None
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        pub_ts = calendar.timegm(entry.published_parsed)

                    items.append({
                        "yt_videoid": entry.get("yt_videoid") or entry.get("id", "").split(":")[-1],
                        "id": entry.get("id"),
                        "title": entry.get("title"),
                        "author": entry.get("author") or entry.get("author_detail", {}).get("name"),
                        "link": entry.get("link"),
                        "published_ts": pub_ts,
                        "media_thumbnail": entry.get("media_thumbnail")
                    })

                if self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
                    self.bot.monitor_manager.set_shared_data(shared_key, items)
            else:
                return []

        return list(reversed(items))

    async def _resolve_thumbnail(self, video_id: str, fallback_thumbnail: str) -> str:
        maxres_url = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
        try:
            session = await http_client.get_session()
            async with session.head(maxres_url) as resp:
                if resp.status == 200:
                    return maxres_url
        except Exception as e:
            log.debug(f"[YouTubeMonitor] Maxres thumbnail probe failed for {video_id}: {e}")
        return fallback_thumbnail

    async def process_item(self, entry: dict):
        video_id = self.get_item_id(entry)
        author_name = entry.get("author") or self.name
        short_link = f"https://youtu.be/{video_id}"
        entry_title = entry.get("title", "Unknown Video")
        published_ts = entry.get("published_ts")

        fallback_thumb = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        if entry.get('media_thumbnail'):
            fallback_thumb = entry['media_thumbnail'][0]["url"]

        thumbnail = await self._resolve_thumbnail(video_id, fallback_thumb)

        if published_ts:
            now_ts = int(datetime.now().timestamp())
            age_hours = (now_ts - published_ts) / 3600
            if age_hours > 24:
                log.info(f"[YouTube] Skipping old video alert for '{entry_title}' ({video_id}) - Age: {age_hours:.1f}h")
                return

        alert_text = self.get_alert_message({"name": author_name, "title": entry_title, "url": short_link})

        if self.config.get("use_native_player", False):
            await self.send_update(content=f"{alert_text}\n{short_link}", view=None)
        else:
            content, layout = generate_youtube_layout(
                bot=self.bot, guild_id=self.guild_id, alert_text=alert_text,
                title=entry_title, url=short_link, image_url=thumbnail,
                author=author_name, published_ts=published_ts,
                accent_color=self.get_color(0xff0000)
            )
            await self.send_update(content=content, view=layout)

    def get_item_id(self, entry: dict) -> str:
        return entry.get("yt_videoid") or entry.get("id", "").split(":")[-1]

    async def mark_items_published(self, items: list[dict]):
        records = []
        for entry in items:
            video_id = self.get_item_id(entry)
            if video_id:
                records.append({
                    "entry_id": str(video_id),
                    "platform": "youtube",
                    "feed_url": self.feed_url,
                    "guild_id": self.guild_id,
                    "title": entry.get("title", "Unknown Video"),
                    "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg",
                    "author_name": entry.get("author") or self.name
                })
        if records:
            await monitor_repo.mark_as_published_bulk(records)

    async def get_latest_item(self):
        items = await self.get_latest_items(1)
        return items[0] if items else None

    async def get_latest_items(self, count: int = 1) -> list[dict]:
        """Fetch latest items."""
        items = await self.fetch_new_items(force_fresh=True)
        if not items:
            return []

        reversed_items = list(reversed(items))
        entries = reversed_items[:count]

        results = []
        for entry in entries:
            results.append(await self._format_entry(entry))
        return results

    async def _format_entry(self, entry: dict) -> dict:
        video_id = self.get_item_id(entry)
        author_name = entry.get("author") or self.name
        short_link = f"https://youtu.be/{video_id}"
        entry_title = entry.get("title", "Unknown Video")
        published_ts = entry.get("published_ts")

        fallback_thumb = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        if entry.get('media_thumbnail'):
            fallback_thumb = entry['media_thumbnail'][0]["url"]

        thumbnail = await self._resolve_thumbnail(video_id, fallback_thumb)
        alert_text = self.get_alert_message({"name": author_name, "title": entry_title, "url": short_link})

        if self.config.get("use_native_player", False):
            return {"content": f"{alert_text}\n{short_link}", "view": None}
        else:
            content, layout = generate_youtube_layout(
                bot=self.bot, guild_id=self.guild_id, alert_text=alert_text,
                title=entry_title, url=short_link, image_url=thumbnail,
                author=author_name, published_ts=published_ts,
                accent_color=self.get_color(0xff0000)
            )
            return {"content": content, "view": layout}
