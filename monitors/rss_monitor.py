import re
import time
import asyncio
import calendar
import feedparser
from core.base_monitor import BaseMonitor
from logger import log
from db import monitor_repo
from clients import http_client
from ui import generate_news_layout

class RSSMonitor(BaseMonitor):
    """Monitor for generic RSS/Atom feeds with automatic caching and Discord Components V2 formatting."""

    def __init__(self, bot, config):
        super().__init__(bot, config)
        self.feed_url = config.get("rss_url") or config.get("feed_url") or config.get("url")

    def get_shared_key(self) -> str:
        return f"rss:{self.feed_url}"

    async def _fetch_feed(self) -> list:
        """Fetch and parse XML feed into an entries list."""
        if not self.feed_url:
            log.warning(f"No RSS URL configured for monitor: {self.name}")
            return []

        try:
            xml_text = await http_client.get_text(self.feed_url)
            if not xml_text:
                return []
            feed = await asyncio.to_thread(feedparser.parse, xml_text)
            if feed and hasattr(feed, 'entries') and feed.entries:
                return list(feed.entries)
        except Exception as e:
            log.error(f"Failed to fetch/parse RSS feed for {self.name}: {e}")
        return []

    async def fetch_new_items(self) -> list[dict]:
        """Fetch RSS entries for the scheduler (oldest first for chronological dispatch)."""
        if not self.feed_url:
            return []

        shared_key = self.get_shared_key()
        entries = None

        if self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
            entries = self.bot.monitor_manager.get_shared_data(shared_key)

        if not entries:
            entries = await self._fetch_feed()
            if entries and self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
                self.bot.monitor_manager.set_shared_data(shared_key, entries)

        if not entries:
            return []

        # Return reversed (oldest -> newest) for sequential delivery
        return list(reversed(entries))

    def _extract_author(self, entry: dict) -> str:
        """Extract author name from entry or fallback to monitor name."""
        author_detail = entry.get("author_detail")
        if isinstance(author_detail, dict) and author_detail.get("name"):
            return author_detail.get("name")
        return entry.get("author") or self.name

    def _extract_image(self, entry: dict) -> str | None:
        """Extract article thumbnail or embedded image from standard RSS/Atom elements."""
        # 1. Media RSS thumbnail
        media_thumb = entry.get("media_thumbnail")
        if media_thumb and isinstance(media_thumb, list) and len(media_thumb) > 0:
            thumb_url = media_thumb[0].get("url")
            if thumb_url:
                return thumb_url

        # 2. Media content enclosure
        media_cont = entry.get("media_content")
        if media_cont and isinstance(media_cont, list) and len(media_cont) > 0:
            cont_url = media_cont[0].get("url")
            if cont_url:
                return cont_url

        # 3. Enclosures (e.g. podcasts / image enclosures)
        enclosures = entry.get("enclosures")
        if enclosures and isinstance(enclosures, list) and len(enclosures) > 0:
            enc = enclosures[0]
            if isinstance(enc, dict) and enc.get("type", "").startswith("image/"):
                enc_href = enc.get("href") or enc.get("url")
                if enc_href:
                    return enc_href

        # 4. Search within HTML description
        desc = entry.get("description", "")
        if isinstance(desc, str) and desc:
            img_match = re.search(r'<img [^>]*src=["\']([^"\']+)["\']', desc)
            if img_match:
                return img_match.group(1)

        # 5. Search within HTML content
        content = entry.get("content")
        if content and isinstance(content, list) and len(content) > 0:
            content_val = content[0].get("value", "") if isinstance(content[0], dict) else ""
            if content_val:
                img_match = re.search(r'<img [^>]*src=["\']([^"\']+)["\']', content_val)
                if img_match:
                    return img_match.group(1)

        return None

    def _extract_timestamp(self, entry: dict) -> int | None:
        """Extract unix timestamp from published or updated struct."""
        parsed = entry.get("published_parsed") or entry.get("updated_parsed")
        if parsed:
            try:
                return calendar.timegm(parsed)
            except (ValueError, TypeError):
                return None
        return None

    def _format_entry(self, entry: dict) -> dict:
        """Format an RSS entry into Discord Components V2 content and layout view."""
        entry_link = entry.get("link", "")
        entry_title = entry.get("title", self.bot.get_feedback("monitor_rss_fallback_title", guild_id=self.guild_id))
        author_name = self._extract_author(entry)
        published_ts = self._extract_timestamp(entry)

        raw_img = self._extract_image(entry)
        img_url = self.get_image_url(raw_img)

        alert_text = self.get_alert_message({
            "name": author_name,
            "title": entry_title,
            "url": entry_link,
            "author": author_name
        })

        content, layout = generate_news_layout(
            bot=self.bot,
            guild_id=self.guild_id,
            alert_text=alert_text,
            title=entry_title[:256],
            url=entry_link,
            image_url=img_url,
            author=author_name,
            published_ts=published_ts,
            accent_color=self.get_color(0x3d3f45)
        )

        return {
            "content": content,
            "view": layout,
            "title": entry_title,
            "published_ts": published_ts
        }

    async def process_item(self, entry: dict):
        """Process and send Discord notification for a single new RSS item."""
        output = self._format_entry(entry)
        published_ts = output.get("published_ts")

        # Safety check: Ignore entries older than 48 hours
        if published_ts:
            age_hours = (int(time.time()) - published_ts) / 3600
            if age_hours > 48:
                log.info(f"[RSS] Skipping old entry for '{output.get('title')}' - Age: {age_hours:.1f}h")
                return

        await self.send_update(content=output["content"], view=output["view"])

    def get_item_id(self, entry: dict) -> str:
        return str(entry.get("id") or entry.get("link") or "")

    async def mark_items_published(self, items: list[dict]):
        """Persist processed RSS items to the database in bulk."""
        records = []
        for entry in items:
            entry_id = self.get_item_id(entry)
            if entry_id:
                title = entry.get("title", "New RSS Update")
                author = self._extract_author(entry)
                records.append({
                    "entry_id": str(entry_id),
                    "platform": "rss",
                    "feed_url": self.feed_url,
                    "guild_id": self.guild_id,
                    "title": title,
                    "author_name": author
                })
        if records:
            await monitor_repo.mark_as_published_bulk(records)

    async def get_latest_item(self) -> dict | None:
        """Fetch the single most recent RSS entry from the feed."""
        items = await self.get_latest_items(1)
        return items[0] if items else None

    async def get_latest_items(self, count: int = 1) -> list[dict]:
        """Fetch the N most recent RSS entries formatted for previews or reposting."""
        entries = await self._fetch_feed()
        if not entries:
            return []

        # Take newest entries up to count and order them oldest -> newest for sequential reposting
        selected = list(reversed(entries[:count]))
        return [self._format_entry(entry) for entry in selected]
