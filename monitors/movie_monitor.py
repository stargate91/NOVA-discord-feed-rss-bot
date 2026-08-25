from core.base_monitor import BaseMonitor
from logger import log
from db import monitor_repo
from providers import TMDBClient
from ui import generate_tmdb_layout

class MovieMonitor(BaseMonitor):
    """Monitor for new movie releases using TMDB API."""

    def __init__(self, bot, config):
        super().__init__(bot, config)
        bearer_token = bot.config.get("tmdb_bearer_token")
        api_key = bot.config.get("tmdb_api_key")
        cache = bot.monitor_manager.cache if (hasattr(bot, "monitor_manager") and bot.monitor_manager) else None

        self.tmdb_client = TMDBClient(bearer_token=bearer_token, api_key=api_key, cache=cache)
        self.tmdb_lang = bot.get_feedback("tmdb_lang_code", guild_id=self.guild_id)
        self.platform = f"movie:{self.tmdb_lang}"
        self.api_url = f"https://api.themoviedb.org/3/movie/now_playing?language={self.tmdb_lang}"

    def get_shared_key(self) -> str:
        return f"tmdb_now_playing:{self.tmdb_lang}"

    async def fetch_new_items(self) -> list[dict]:
        """Fetch TMDB Now Playing and look for new movies."""
        if not self.tmdb_client.bearer_token and not self.tmdb_client.api_key:
            log.warning("TMDB Auth missing in configuration. Movie monitor disabled.")
            return []

        shared_key = self.get_shared_key()
        feed = None
        if self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
            feed = self.bot.monitor_manager.get_shared_data(shared_key)

        if not feed:
            feed = await self.tmdb_client.fetch_now_playing_movies(self.tmdb_lang)
            if feed and self.bot and hasattr(self.bot, "monitor_manager") and self.bot.monitor_manager:
                self.bot.monitor_manager.set_shared_data(shared_key, feed)

        if not feed or not isinstance(feed, list):
            return []

        all_candidates = []
        for movie in feed:
            movie_id = str(movie.get("id"))
            if not movie_id:
                continue
            all_candidates.append(movie)

        return list(reversed(all_candidates))

    def _build_tmdb_data(self, movie: dict, genre_map: dict) -> dict:
        """Extract common data fields from a TMDB movie object."""
        movie_id = str(movie.get("id"))
        title = movie.get("title", "")
        overview = movie.get("overview", "")
        release_date = movie.get("release_date", self.bot.get_feedback("default_na", guild_id=self.guild_id))

        genre_ids = movie.get("genre_ids", [])
        genre_names = [genre_map.get(gid) for gid in genre_ids if genre_map.get(gid)]
        genre_text = ", ".join(genre_names) if genre_names else None

        vote_avg = movie.get("vote_average", 0)
        vote_count = movie.get("vote_count", 0)
        na_text = self.bot.get_feedback("default_na", guild_id=self.guild_id)
        score_text = f"{vote_avg:.1f} ({vote_count})" if vote_count > 0 else na_text

        poster_path = movie.get("poster_path")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None

        backdrop_path = movie.get("backdrop_path")
        backdrop_url = f"https://image.tmdb.org/t/p/w780{backdrop_path}" if backdrop_path else None
        backdrop_url = self.get_image_url(backdrop_url)

        tmdb_url = f"https://www.themoviedb.org/movie/{movie_id}"

        return {
            "movie_id": movie_id,
            "title": title,
            "overview": overview,
            "release_date": release_date,
            "genre_text": genre_text,
            "score_text": score_text,
            "poster_url": poster_url,
            "backdrop_url": backdrop_url,
            "tmdb_url": tmdb_url
        }

    def _matches_filters(self, movie: dict) -> bool:
        """Check if movie matches configured target genres and languages."""
        target_genres = self.config.get("target_genres", [])
        if target_genres:
            item_genres = [str(g) for g in movie.get("genre_ids", [])]
            orig_lang = movie.get("original_language", "")
            if orig_lang in ["ja", "zh", "ko"] and "16" in item_genres:
                item_genres.append("9999")
            if not any(g in target_genres for g in item_genres):
                return False

        target_languages = self.config.get("target_languages", [])
        if target_languages:
            orig_lang = movie.get("original_language", "")
            if orig_lang not in target_languages:
                return False

        return True

    async def process_item(self, movie: dict):
        if not self._matches_filters(movie):
            return

        genre_map = await self.tmdb_client.fetch_genres("movie", self.tmdb_lang)
        data = self._build_tmdb_data(movie, genre_map)

        title = data["title"]
        overview = data["overview"]
        movie_id = data["movie_id"]

        # Fallbacks
        if (not title or not overview) and self.tmdb_lang != "en-US":
            en_data = await self.tmdb_client.fetch_details("movie", movie_id, language="en-US")
            if not title:
                title = en_data.get("title", "")
            if not overview:
                overview = en_data.get("overview", "")

        if not title:
            title = movie.get("original_title", "")
        if not overview:
            orig_data = await self.tmdb_client.fetch_details("movie", movie_id, original=True)
            overview = orig_data.get("overview", "")
        if not title:
            title = self.bot.get_feedback("monitor_movie_fallback_title", guild_id=self.guild_id)

        trailer_url = await self.tmdb_client.fetch_trailer_url("movie", movie_id, self.tmdb_lang)

        alert_text = self.get_alert_message({
            "name": self.bot.get_feedback("monitor_platform_movie", guild_id=self.guild_id),
            "title": title,
            "url": data["tmdb_url"]
        })

        content, layout = generate_tmdb_layout(
            bot=self.bot,
            guild_id=self.guild_id,
            alert_text=alert_text,
            title=title[:256],
            url=data["tmdb_url"],
            backdrop_url=data["backdrop_url"],
            poster_url=data["poster_url"],
            score_text=data["score_text"],
            genre_text=data["genre_text"],
            release_date=data["release_date"],
            trailer_url=trailer_url,
            accent_color=self.get_color(0x3d3f45)
        )

        await self.send_update(content=content, view=layout)

    def get_item_id(self, movie: dict) -> str:
        return str(movie.get("id"))

    async def mark_items_published(self, items: list[dict]):
        records = []
        for movie in items:
            movie_id = self.get_item_id(movie)
            if movie_id:
                title = movie.get("title") or movie.get("original_title")
                poster_path = movie.get("poster_path")
                thumbnail = f"https://image.tmdb.org/t/p/w200{poster_path}" if poster_path else None
                records.append({
                    "entry_id": str(movie_id),
                    "platform": self.platform,
                    "feed_url": self.api_url,
                    "guild_id": self.guild_id,
                    "title": title,
                    "thumbnail_url": thumbnail,
                    "author_name": "TMDB Movies"
                })
        if records:
            await monitor_repo.mark_as_published_bulk(records)

    async def get_latest_item(self):
        items = await self.get_latest_items(1)
        return items[0] if items else None

    async def get_latest_items(self, count: int = 1) -> list[dict]:
        """Fetch the N most recent movies matching filters."""
        raw_movies = await self.tmdb_client.fetch_now_playing_movies(self.tmdb_lang)
        if not raw_movies:
            return []

        filtered = [m for m in raw_movies if self._matches_filters(m)][:count]
        genre_map = await self.tmdb_client.fetch_genres("movie", self.tmdb_lang)

        results = []
        for movie in reversed(filtered):
            data = self._build_tmdb_data(movie, genre_map)
            title = data["title"] or movie.get("original_title") or self.bot.get_feedback("monitor_movie_fallback_title", guild_id=self.guild_id)
            trailer_url = await self.tmdb_client.fetch_trailer_url("movie", data["movie_id"], self.tmdb_lang)
            alert_text = self.get_alert_message({
                "name": self.bot.get_feedback("monitor_platform_movie", guild_id=self.guild_id),
                "title": title,
                "url": data["tmdb_url"]
            })
            content, layout = generate_tmdb_layout(
                bot=self.bot,
                guild_id=self.guild_id,
                alert_text=alert_text,
                title=title[:256],
                url=data["tmdb_url"],
                backdrop_url=data["backdrop_url"],
                poster_url=data["poster_url"],
                score_text=data["score_text"],
                genre_text=data["genre_text"],
                release_date=data["release_date"],
                trailer_url=trailer_url,
                accent_color=self.get_color(0x3d3f45)
            )
            results.append({"content": content, "view": layout, "title": title})

        return results
