from clients import http_client
from logger import log

class TMDBClient:
    """Provider client for The Movie Database (TMDB) API with auth header management and genre caching."""

    BASE_URL = "https://api.themoviedb.org/3"

    def __init__(self, bearer_token: str | None = None, api_key: str | None = None, cache=None):
        self.bearer_token = bearer_token
        self.api_key = api_key
        self.cache = cache
        self._local_genres_cache: dict[str, dict[int, str]] = {}

    def get_headers(self) -> dict:
        """Return Authorization header if Bearer token is available."""
        if self.bearer_token:
            return {"Authorization": f"Bearer {self.bearer_token}"}
        return {}

    def _build_url(self, endpoint: str, language: str | None = None, extra_params: str = "") -> str:
        """Construct full TMDB API URL with language and fallback API key."""
        params = []
        if language:
            params.append(f"language={language}")
        if not self.bearer_token and self.api_key:
            params.append(f"api_key={self.api_key}")
        if extra_params:
            params.append(extra_params)

        query = ("?" + "&".join(params)) if params else ""
        return f"{self.BASE_URL}/{endpoint}{query}"

    async def fetch_now_playing_movies(self, language: str = "en-US") -> list[dict]:
        """Fetch currently playing movies."""
        url = self._build_url("movie/now_playing", language=language)
        data = await http_client.get_json(url, headers=self.get_headers())
        if data and isinstance(data, dict):
            return data.get("results", [])
        return []

    async def fetch_trending_tv_series(self, language: str = "en-US") -> list[dict]:
        """Fetch trending TV series of the day."""
        url = self._build_url("trending/tv/day", language=language)
        data = await http_client.get_json(url, headers=self.get_headers())
        if data and isinstance(data, dict):
            return data.get("results", [])
        return []

    async def fetch_genres(self, media_type: str = "movie", language: str = "en-US") -> dict[int, str]:
        """Fetch and cache genre mapping for movie or tv."""
        cache_key = f"{media_type}:{language}"

        # 1. Check shared cache if provided
        if self.cache and hasattr(self.cache, "tmdb_genres_cache"):
            if cache_key in self.cache.tmdb_genres_cache:
                return self.cache.tmdb_genres_cache[cache_key]

        # 2. Check local fallback cache
        if cache_key in self._local_genres_cache:
            return self._local_genres_cache[cache_key]

        url = self._build_url(f"genre/{media_type}/list", language=language)
        try:
            data = await http_client.get_json(url, headers=self.get_headers())
            if data and isinstance(data, dict):
                mapping = {g["id"]: g["name"] for g in data.get("genres", [])}
                if self.cache and hasattr(self.cache, "tmdb_genres_cache"):
                    self.cache.tmdb_genres_cache[cache_key] = mapping
                self._local_genres_cache[cache_key] = mapping
                return mapping
        except Exception as e:
            log.error(f"[TMDBClient] Error fetching {media_type} genres: {e}")
        return {}

    async def fetch_details(self, media_type: str, item_id: int | str, language: str = "en-US", original: bool = False) -> dict:
        """Fetch detailed information for a movie or TV show (used as fallback when local fields are missing)."""
        lang = None if original else language
        url = self._build_url(f"{media_type}/{item_id}", language=lang)
        data = await http_client.get_json(url, headers=self.get_headers())
        return data if isinstance(data, dict) else {}

    async def fetch_trailer_url(self, media_type: str, item_id: int | str, language: str = "en-US") -> str | None:
        """
        Fetch YouTube trailer URL with fallback tiers:
        1. Localized language
        2. English (en-US)
        3. Default/any video
        """
        tiers = [
            self._build_url(f"{media_type}/{item_id}/videos", language=language),
            self._build_url(f"{media_type}/{item_id}/videos", language="en-US") if language != "en-US" else None,
            self._build_url(f"{media_type}/{item_id}/videos")
        ]

        best_video = None
        for url in tiers:
            if not url:
                continue

            data = await http_client.get_json(url, headers=self.get_headers())
            if not data or not isinstance(data, dict):
                continue

            results = data.get("results", [])
            for vid in results:
                if vid.get("site") == "YouTube":
                    v_type = vid.get("type")
                    if v_type == "Trailer":
                        return f"https://www.youtube.com/watch?v={vid.get('key')}"
                    elif v_type in ("Teaser", "Clip") and not best_video:
                        best_video = f"https://www.youtube.com/watch?v={vid.get('key')}"

            if best_video:
                return best_video

        return None
