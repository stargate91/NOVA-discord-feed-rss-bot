from datetime import datetime
from logger import log
from core.base_monitor import BaseMonitor
from db import monitor_repo
from providers import GamerPowerClient
from ui import generate_free_game_layout

class BaseGameGiveawayMonitor(BaseMonitor):
    """Abstract base class for game giveaway monitors powered by GamerPower."""

    def __init__(self, bot, config, platform_name: str, platform_emoji: str, gamerpower_platform: str):
        super().__init__(bot, config)
        self.platform_name = platform_name
        self.platform_emoji = platform_emoji
        self.gamerpower_platform = gamerpower_platform
        self.client = GamerPowerClient()
        
        # Resolve include_dlc flag from config or extra_settings
        extra = config.get("extra_settings", {}) if isinstance(config.get("extra_settings"), dict) else {}
        self.include_dlc = config.get("include_dlc", False) or extra.get("include_dlc", False)

    def get_shared_key(self) -> str:
        return f"{self.gamerpower_platform}_free_giveaways"

    async def fetch_new_items(self) -> list[dict]:
        """Fetch giveaways for the platform from GamerPower and apply DLC filter."""
        shared_key = self.get_shared_key()
        data = None
        if self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
            data = self.bot.monitor_manager.get_shared_data(shared_key)

        if not data:
            data = await self.client.fetch_giveaways(self.gamerpower_platform)
            if data and self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
                self.bot.monitor_manager.set_shared_data(shared_key, data)

        if not isinstance(data, list):
            return []

        include_dlc = getattr(self, "include_dlc", False)
        all_candidates = []
        for game in data:
            giveaway_type = game.get("type", "").lower()
            # Filter for full games unless DLC inclusion is enabled
            if not include_dlc and giveaway_type and giveaway_type != "game":
                continue
            all_candidates.append(game)

        return list(reversed(all_candidates))

    def _format_game_title(self, raw_title: str) -> str:
        """Strip platform markers and add platform emoji."""
        cleaned = raw_title.replace(f"({self.platform_name})", "").replace("Giveaway", "").strip()
        return f"{self.platform_emoji} {cleaned}".strip()

    async def process_item(self, game: dict):
        """Build layout and send Discord notification for a free game."""
        raw_title = game.get("title", self.bot.get_feedback("default_unknown", guild_id=self.guild_id))
        title = self._format_game_title(raw_title)

        game_url = game.get("open_giveaway_url") or game.get("gamerpower_url", "")
        # For non-steam platforms, avoid steam redirect links if present
        if self.gamerpower_platform != "steam" and ("steampowered.com" in game_url.lower() or "steamcommunity.com" in game_url.lower()):
            game_url = game.get("gamerpower_url", game_url)

        image_url = self.get_image_url(game.get("image") or game.get("thumbnail"))
        na_text = self.bot.get_feedback("default_na", guild_id=self.guild_id)
        worth = game.get("worth", na_text)
        giveaway_type = game.get("type", "Game")
        end_date = game.get("end_date", na_text)

        expiry_ts = None
        if end_date and end_date != na_text:
            try:
                dt = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")
                expiry_ts = int(dt.timestamp())
            except (ValueError, TypeError):
                try:
                    dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
                    expiry_ts = int(dt.timestamp())
                except Exception as e:
                    log.debug(f"[{self.platform_name}] Could not parse end_date '{end_date}': {e}")

        alert_text = self.get_alert_message({
            "name": self.platform_name,
            "title": title,
            "url": game_url
        })

        content, layout = generate_free_game_layout(
            bot=self.bot,
            guild_id=self.guild_id,
            alert_text=alert_text,
            title=title,
            game_url=game_url,
            image_url=image_url,
            worth=worth,
            giveaway_type=giveaway_type,
            expiry_ts=expiry_ts,
            accent_color=self.get_color(0x3d3f45)
        )

        await self.send_update(content=content, view=layout)

    def get_item_id(self, game: dict) -> str:
        return str(game.get("id"))

    async def mark_items_published(self, items: list[dict]):
        records = []
        for game in items:
            giveaway_id = self.get_item_id(game)
            if giveaway_id and giveaway_id != "None":
                records.append({
                    "entry_id": str(giveaway_id),
                    "platform": self.platform,
                    "feed_url": self.gamerpower_platform,
                    "guild_id": self.guild_id,
                    "title": game.get("title", "Unknown Game"),
                    "thumbnail_url": self.get_image_url(game.get("image") or game.get("thumbnail")),
                    "author_name": self.platform.capitalize()
                })
        if records:
            await monitor_repo.mark_as_published_bulk(records)

    async def get_latest_item(self):
        items = await self.get_latest_items(1)
        return items[0] if items else None

    async def get_latest_items(self, count: int = 1) -> list[dict]:
        """Fetch latest giveaways and format them for preview or reposting."""
        data = await self.client.fetch_giveaways(self.gamerpower_platform)
        if not data or not isinstance(data, list):
            return []

        include_dlc = getattr(self, "include_dlc", False)
        filtered = []
        for game in data:
            giveaway_type = game.get("type", "").lower()
            if not include_dlc and giveaway_type and giveaway_type != "game":
                continue
            filtered.append(game)

        games = filtered[:count]
        formatted = []
        for game in games:
            raw_title = game.get("title", self.bot.get_feedback("default_unknown", guild_id=self.guild_id))
            title = self._format_game_title(raw_title)
            game_url = game.get("open_giveaway_url") or game.get("gamerpower_url", "")
            image_url = self.get_image_url(game.get("image") or game.get("thumbnail"))
            na_text = self.bot.get_feedback("default_na", guild_id=self.guild_id)
            worth = game.get("worth", na_text)
            giveaway_type = game.get("type", "Game")
            end_date = game.get("end_date", na_text)

            expiry_ts = None
            if end_date and end_date != na_text:
                try:
                    dt = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")
                    expiry_ts = int(dt.timestamp())
                except (ValueError, TypeError):
                    try:
                        dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
                        expiry_ts = int(dt.timestamp())
                    except Exception as e:
                        log.debug(f"[{self.platform_name}] Could not parse end_date '{end_date}': {e}")

            alert_text = self.get_alert_message({
                "name": self.platform_name,
                "title": title,
                "url": game_url
            })

            content, layout = generate_free_game_layout(
                bot=self.bot,
                guild_id=self.guild_id,
                alert_text=alert_text,
                title=title,
                game_url=game_url,
                image_url=image_url,
                worth=worth,
                giveaway_type=giveaway_type,
                expiry_ts=expiry_ts,
                accent_color=self.get_color(0x3d3f45)
            )
            formatted.append({"content": content, "view": layout, "title": title})

        return formatted
