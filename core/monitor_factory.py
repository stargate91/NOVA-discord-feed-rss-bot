from typing import Callable, Any, Type
from logger import log
from core.base_monitor import BaseMonitor
from monitors.youtube_monitor import YouTubeMonitor
from monitors.rss_monitor import RSSMonitor
from monitors.epic_games_monitor import EpicGamesMonitor
from monitors.steam_free_monitor import SteamFreeMonitor
from monitors.gog_free_monitor import GOGFreeMonitor
from monitors.steam_news_monitor import SteamNewsMonitor
from monitors.movie_monitor import MovieMonitor
from monitors.tv_series_monitor import TVSeriesMonitor
from monitors.stream_monitor import TwitchMonitor, KickMonitor
from monitors.crypto_monitor import CryptoMonitor
from monitors.github_monitor import GitHubMonitor

MonitorFactoryType = Type[BaseMonitor] | Callable[[Any, dict], BaseMonitor | None]

class MonitorFactory:
    """
    Enterprise Registry & Factory for Feed Monitors.
    Provides decoupled provider registration and instantiation.
    """
    _registry: dict[str, MonitorFactoryType] = {}

    @classmethod
    def register(cls, type_name: str, factory_or_cls: MonitorFactoryType | None = None):
        """Register a monitor class or custom factory callable for a platform type."""
        def decorator(target: MonitorFactoryType) -> MonitorFactoryType:
            cls._registry[type_name.strip().lower()] = target
            return target

        if factory_or_cls is not None:
            return decorator(factory_or_cls)
        return decorator

    @classmethod
    def unregister(cls, type_name: str) -> bool:
        """Unregister a platform type from the registry."""
        return cls._registry.pop(type_name.strip().lower(), None) is not None

    @classmethod
    def registered_types(cls) -> list[str]:
        """Return all currently registered platform type names."""
        return sorted(cls._registry.keys())

    @classmethod
    def is_registered(cls, type_name: str) -> bool:
        """Check if a platform type is registered."""
        return bool(type_name and type_name.strip().lower() in cls._registry)

    @classmethod
    def create(cls, bot: Any, config: dict) -> BaseMonitor | None:
        """Instantiate a monitor for the configured platform type."""
        if not isinstance(config, dict) and not hasattr(config, "get"):
            log.warning(f"[MonitorFactory] Invalid config format: {type(config)}")
            return None

        m_type = config.get("type")
        if not m_type or not isinstance(m_type, str):
            log.warning("[MonitorFactory] Monitor config missing valid 'type' attribute.")
            return None

        factory = cls._registry.get(m_type.strip().lower())
        if not factory:
            log.warning(f"[MonitorFactory] Unsupported monitor type: '{m_type}'")
            return None

        try:
            return factory(bot, config)
        except Exception as e:
            log.error(f"[MonitorFactory] Error creating monitor '{m_type}': {e}", exc_info=True)
            return None


# Helper provider for crypto entitlement gating
def _crypto_monitor_factory(bot: Any, config: dict) -> BaseMonitor | None:
    guild_id = config.get("guild_id", 0)
    if bot is not None and hasattr(bot, "has_feature"):
        if not bot.has_feature(guild_id, "crypto"):
            return None
    return CryptoMonitor(bot, config)


# Built-in platform registrations
MonitorFactory.register("youtube", YouTubeMonitor)
MonitorFactory.register("rss", RSSMonitor)
MonitorFactory.register("epic_games", EpicGamesMonitor)
MonitorFactory.register("steam_free", SteamFreeMonitor)
MonitorFactory.register("gog_free", GOGFreeMonitor)
MonitorFactory.register("steam_news", SteamNewsMonitor)
MonitorFactory.register("movie", MovieMonitor)
MonitorFactory.register("tv_series", TVSeriesMonitor)
MonitorFactory.register("twitch", TwitchMonitor)
MonitorFactory.register("kick", KickMonitor)
MonitorFactory.register("crypto", _crypto_monitor_factory)
MonitorFactory.register("github", GitHubMonitor)

__all__ = ["MonitorFactory"]
