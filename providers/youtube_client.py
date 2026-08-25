import os
from clients import http_client
from logger import log

class YouTubeClient:
    """Provider client for resolving YouTube channels and fetching XML RSS feeds."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("YOUTUBE_API_KEY")

    async def resolve_channel_id(self, input_str: str) -> tuple[str, str] | None:
        """
        Resolves a YouTube username, handle, or custom name to a UCID and Title.
        Returns (channel_id, title) or None.
        """
        if not input_str:
            return None

        input_str = input_str.strip()
        if input_str.startswith("UC") and len(input_str) == 24:
            return (input_str, input_str)

        if not self.api_key:
            log.warning("[YouTubeClient] YOUTUBE_API_KEY is missing in environment. Cannot resolve handles.")
            return None

        try:
            handle = input_str if input_str.startswith("@") else f"@{input_str}"
            log.info(f"[YouTubeClient] Resolving handle '{handle}' (Input: {input_str})")

            # 1. Try by Handle
            url = "https://www.googleapis.com/youtube/v3/channels"
            params = {
                "part": "snippet",
                "forHandle": handle,
                "key": self.api_key
            }
            data = await http_client.get_json(url, params=params)
            if data and isinstance(data, dict) and data.get("items"):
                ucid = data["items"][0]["id"]
                title = data["items"][0]["snippet"]["title"]
                log.info(f"[YouTubeClient] Handle Match! '{handle}' -> '{ucid}' ({title})")
                return (ucid, title)

            # 2. Fallback to Search
            search_query = input_str.replace("@", "")
            log.info(f"[YouTubeClient] Falling back to search for: '{search_query}'")
            search_url = "https://www.googleapis.com/youtube/v3/search"
            search_params = {
                "part": "snippet",
                "q": search_query,
                "type": "channel",
                "maxResults": 1,
                "key": self.api_key
            }
            search_data = await http_client.get_json(search_url, params=search_params)
            if search_data and isinstance(search_data, dict) and search_data.get("items"):
                ucid = search_data["items"][0]["id"]["channelId"]
                title = search_data["items"][0]["snippet"]["title"]
                log.info(f"[YouTubeClient] Search Match! '{search_query}' -> '{ucid}' ({title})")
                return (ucid, title)

        except Exception as e:
            log.error(f"[YouTubeClient] Resolution error for '{input_str}': {e}")

        return None

    async def fetch_channel_feed(self, channel_id: str) -> list[dict]:
        """Fetch and parse the RSS XML feed for a YouTube channel."""
        if not channel_id:
            return []

        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        xml_text = await http_client.get_text(url)
        if not xml_text:
            return []

        try:
            import feedparser
            import asyncio
            feed = await asyncio.to_thread(feedparser.parse, xml_text)
            return list(feed.entries) if hasattr(feed, "entries") else []
        except Exception as e:
            log.error(f"[YouTubeClient] Error parsing feed for {channel_id}: {e}")
            return []
