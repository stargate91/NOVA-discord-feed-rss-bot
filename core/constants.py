# ==========================================
# Nova Discord Feed Bot - Global Constants
# ==========================================

# 1. Cache & Concurrency Defaults
DEFAULT_GUILD_CACHE_MAX_SIZE: int = 5000
DEFAULT_SHARED_CACHE_MAX_SIZE: int = 2000
DEFAULT_SHARED_CACHE_TTL_SECONDS: int = 120
DEFAULT_MAX_POLLING_CONCURRENCY: int = 15
DEFAULT_DEAD_CHANNEL_TTL_SECONDS: int = 3600
MAX_DEAD_CHANNELS_CAPACITY: int = 5000

# 2. Ingestion & Interval Defaults
DEFAULT_FEED_POLL_INTERVAL_SECONDS: int = 60
DEFAULT_REFRESH_INTERVAL_MINUTES: int = 20
DEFAULT_DATA_RETENTION_DAYS: int = 60

# 3. Localization & Internationalization
DEFAULT_LANGUAGE: str = "en"
SUPPORTED_LOCALES: tuple[str, ...] = (
    "ar", "cs", "de", "en", "es", "fr", "he", "hu", "it", "ja",
    "ko", "nl", "pl", "pt", "ru", "sv", "tr", "zh", "zh-tw"
)

# 4. Telemetry & Performance Thresholds
DEFAULT_SLOW_QUERY_THRESHOLD_MS: float = 100.0
DEFAULT_LOG_RING_BUFFER_SIZE: int = 1000
DEFAULT_MAX_QUEUE_CAPACITY: int = 5000

__all__ = [
    "DEFAULT_GUILD_CACHE_MAX_SIZE",
    "DEFAULT_SHARED_CACHE_MAX_SIZE",
    "DEFAULT_SHARED_CACHE_TTL_SECONDS",
    "DEFAULT_MAX_POLLING_CONCURRENCY",
    "DEFAULT_DEAD_CHANNEL_TTL_SECONDS",
    "MAX_DEAD_CHANNELS_CAPACITY",
    "DEFAULT_FEED_POLL_INTERVAL_SECONDS",
    "DEFAULT_REFRESH_INTERVAL_MINUTES",
    "DEFAULT_DATA_RETENTION_DAYS",
    "DEFAULT_LANGUAGE",
    "SUPPORTED_LOCALES",
    "DEFAULT_SLOW_QUERY_THRESHOLD_MS",
    "DEFAULT_LOG_RING_BUFFER_SIZE",
    "DEFAULT_MAX_QUEUE_CAPACITY",
]
