from core.base_monitor import BaseMonitor
from logger import log
from db import monitor_repo
from providers import TMDBClient
from ui import generate_tmdb_layout

class TVSeriesMonitor(BaseMonitor):
    """Monitor for TV series updates via TMDB."""

    def __init__(self, bot, config):
        super().__init__(bot, config)
        bearer_token = bot.config.get("tmdb_bearer_token")
        api_key = bot.config.get("tmdb_api_key")
        cache = bot.monitor_manager.cache if (hasattr(bot, "monitor_manager") and bot.monitor_manager) else None

        self.tmdb_client = TMDBClient(bearer_token=bearer_token, api_key=api_key, cache=cache)
        self.tmdb_lang = bot.get_feedback("tmdb_lang_code", guild_id=self.guild_id)
        self.platform = f"tv_series:{self.tmdb_lang}"
        self.api_url = f"https://api.themoviedb.org/3/trending/tv/day?language={self.tmdb_lang}"

    def get_shared_key(self) -> str:
        return f"tmdb_tv_trending:{self.tmdb_lang}"

    async def fetch_new_items(self) -> list[dict]:
        """Fetch trending TV series and look for new items."""
        if not self.tmdb_client.bearer_token and not self.tmdb_client.api_key:
            log.warning("No TMDB API key provided.")
            return []

        shared_key = self.get_shared_key()
        trending = None
        if self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
            trending = self.bot.monitor_manager.get_shared_data(shared_key)

        if not trending:
            trending = await self.tmdb_client.fetch_trending_tv_series(self.tmdb_lang)
            if trending and self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
                self.bot.monitor_manager.set_shared_data(shared_key, trending)

        if not trending or not isinstance(trending, list):
            return []

        all_candidates = []
        for series in trending:
            series_id = str(series.get("id"))
            if not series_id:
                continue
            all_candidates.append(series)

        return list(reversed(all_candidates))

    def _build_tmdb_data(self, series: dict, genre_map: dict) -> dict:
        """Extract common data fields from a TMDB series object."""
        series_id = str(series.get("id"))
        name = series.get("name", "")
        overview = series.get("overview", "")
        first_air_date = series.get("first_air_date", self.bot.get_feedback("default_na", guild_id=self.guild_id))

        genre_ids = series.get("genre_ids", [])
        genre_names = [genre_map.get(gid) for gid in genre_ids if genre_map.get(gid)]
        genre_text = ", ".join(genre_names) if genre_names else None

        vote_avg = series.get("vote_average", 0)
        vote_count = series.get("vote_count", 0)
        na_text = self.bot.get_feedback("default_na", guild_id=self.guild_id)
        score_text = f"{vote_avg:.1f} ({vote_count})" if vote_count > 0 else na_text

        poster_path = series.get("poster_path")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None

        backdrop_path = series.get("backdrop_path")
        backdrop_url = f"https://image.tmdb.org/t/p/w780{backdrop_path}" if backdrop_path else None
        backdrop_url = self.get_image_url(backdrop_url)

        tmdb_url = f"https://www.themoviedb.org/tv/{series_id}"

        return {
            "series_id": series_id,
            "name": name,
            "overview": overview,
            "first_air_date": first_air_date,
            "genre_text": genre_text,
            "score_text": score_text,
            "poster_url": poster_url,
            "backdrop_url": backdrop_url,
            "tmdb_url": tmdb_url
        }

    def _matches_filters(self, series: dict) -> bool:
        """Check if series matches configured target genres and languages."""
        target_genres = self.config.get("target_genres", [])
        if target_genres:
            item_genres = [str(g) for g in series.get("genre_ids", [])]
            orig_lang = series.get("original_language", "")
            if orig_lang in ["ja", "zh", "ko"] and "16" in item_genres:
                item_genres.append("9999")
            if not any(g in target_genres for g in item_genres):
                return False

        target_languages = self.config.get("target_languages", [])
        if target_languages:
            orig_lang = series.get("original_language", "")
            if orig_lang not in target_languages:
                return False

        return True

    async def process_item(self, series: dict):
        if not self._matches_filters(series):
            return

        genre_map = await self.tmdb_client.fetch_genres("tv", self.tmdb_lang)
        data = self._build_tmdb_data(series, genre_map)

        name = data["name"]
        overview = data["overview"]
        series_id = data["series_id"]

        # Fallbacks
        if (not name or not overview) and self.tmdb_lang != "en-US":
            en_data = await self.tmdb_client.fetch_details("tv", series_id, language="en-US")
            if not name:
                name = en_data.get("name", "")
            if not overview:
                overview = en_data.get("overview", "")

        if not name:
            name = series.get("original_name", "")
        if not overview:
            orig_data = await self.tmdb_client.fetch_details("tv", series_id, original=True)
            overview = orig_data.get("overview", "")
        if not name:
            name = self.bot.get_feedback("monitor_tv_fallback_title", guild_id=self.guild_id)

        trailer_url = await self.tmdb_client.fetch_trailer_url("tv", series_id, self.tmdb_lang)

        alert_text = self.get_alert_message({
            "name": self.bot.get_feedback("monitor_platform_tv", guild_id=self.guild_id),
            "title": name,
            "url": data["tmdb_url"]
        })

        content, layout = generate_tmdb_layout(
            bot=self.bot,
            guild_id=self.guild_id,
            alert_text=alert_text,
            title=name[:256],
            url=data["tmdb_url"],
            backdrop_url=data["backdrop_url"],
            poster_url=data["poster_url"],
            score_text=data["score_text"],
            genre_text=data["genre_text"],
            release_date=data["first_air_date"],
            trailer_url=trailer_url,
            accent_color=self.get_color(0x3d3f45)
        )

        await self.send_update(content=content, view=layout)

    def get_item_id(self, item: dict) -> str:
        return str(item.get("id"))

    async def mark_items_published(self, items: list[dict]):
        records = []
        for series in items:
            series_id = self.get_item_id(series)
            if series_id:
                tmdb_url = f"https://www.themoviedb.org/tv/{series_id}"
                title = series.get("name") or series.get("original_name")
                poster_path = series.get("poster_path")
                thumbnail = f"https://image.tmdb.org/t/p/w200{poster_path}" if poster_path else None
                records.append({
                    "entry_id": str(series_id),
                    "platform": self.platform,
                    "feed_url": tmdb_url,
                    "guild_id": self.guild_id,
                    "title": title,
                    "thumbnail_url": thumbnail,
                    "author_name": "TMDB TV"
                })
        if records:
            await monitor_repo.mark_as_published_bulk(records)

    async def get_latest_item(self):
        items = await self.get_latest_items(1)
        return items[0] if items else None

    async def get_latest_items(self, count: int = 1) -> list[dict]:
        """Fetch the N most recent TV series matching filters."""
        raw_series = await self.tmdb_client.fetch_trending_tv_series(self.tmdb_lang)
        if not raw_series:
            return []

        filtered = [s for s in raw_series if self._matches_filters(s)][:count]
        genre_map = await self.tmdb_client.fetch_genres("tv", self.tmdb_lang)

        results = []
        for series in reversed(filtered):
            data = self._build_tmdb_data(series, genre_map)
            name = data["name"] or series.get("original_name") or self.bot.get_feedback("monitor_tv_fallback_title", guild_id=self.guild_id)
            trailer_url = await self.tmdb_client.fetch_trailer_url("tv", data["series_id"], self.tmdb_lang)
            alert_text = self.get_alert_message({
                "name": self.bot.get_feedback("monitor_platform_tv", guild_id=self.guild_id),
                "title": name,
                "url": data["tmdb_url"]
            })
            content, layout = generate_tmdb_layout(
                bot=self.bot,
                guild_id=self.guild_id,
                alert_text=alert_text,
                title=name[:256],
                url=data["tmdb_url"],
                backdrop_url=data["backdrop_url"],
                poster_url=data["poster_url"],
                score_text=data["score_text"],
                genre_text=data["genre_text"],
                release_date=data["first_air_date"],
                trailer_url=trailer_url,
                accent_color=self.get_color(0x3d3f45)
            )
            results.append({"content": content, "view": layout, "title": name})

        return results
