import json
import os
from dataclasses import dataclass, field
from typing import Any
from dotenv import load_dotenv

@dataclass
class PermissionConfig:
    admin_permissions: list[str] = field(default_factory=lambda: ["administrator", "manage_guild"])
    admin_role_enabled: bool = True

@dataclass
class TierDefinition:
    name: str = "Free"
    min_refresh_interval: int = 20
    max_monitors: int = 2
    max_purge: int = 10
    max_channels: int = 1
    max_pings: int = 1
    features: list[str] = field(default_factory=list)

@dataclass
class StripeProductConfig:
    tier: int = 1
    interval: str = "mo"
    days: int = 30
    label: str = ""

@dataclass
class StripeConfig:
    success_url: str = "https://novafeeds.xyz/dashboard?payment=success"
    cancel_url: str = "https://novafeeds.xyz/premium"
    products: dict[str, dict] = field(default_factory=dict)

@dataclass
class BotConfig:
    """
    Type-safe, validated configuration for Nova Discord Bot.
    Provides both attribute access (config.token) and dictionary compatibility (config.get('token')).
    """
    command_prefix: str = "!"
    command_suffix: str = "_nova"
    master_guilds: dict[str, int] = field(default_factory=dict)
    master_user_ids: list[int] = field(default_factory=list)
    permission_config: dict = field(default_factory=dict)
    tier_config: dict = field(default_factory=dict)
    stripe_config: dict = field(default_factory=dict)
    
    # Secrets & API credentials
    token: str | None = None
    database_url: str | None = None
    tmdb_api_key: str | None = None
    tmdb_bearer_token: str | None = None
    twitch_client_id: str | None = None
    twitch_client_secret: str | None = None
    kick_client_id: str | None = None
    kick_client_secret: str | None = None
    github_token: str | None = None
    youtube_api_key: str | None = None
    webhook_secret: str | None = None

    # Storage for any arbitrary extra fields from config.json
    _raw_data: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def load(cls, config_file: str = "config.json") -> "BotConfig":
        """Load configuration from JSON and environment variables."""
        load_dotenv()
        load_dotenv("web/.env.local")

        raw_config = {}
        if os.path.exists(config_file):
            try:
                with open(config_file, "r", encoding="utf-8") as f:
                    raw_config = json.load(f)
            except Exception as e:
                raise RuntimeError(f"Failed to read configuration file {config_file}: {e}")
        else:
            raise FileNotFoundError(f"Configuration file not found: {config_file}")

        # Resolve credentials with env fallback priority
        token = os.getenv("BOT_TOKEN") or raw_config.get("token")
        database_url = os.getenv("DATABASE_URL") or raw_config.get("database_url")
        tmdb_api_key = os.getenv("TMDB_API_KEY") or raw_config.get("tmdb_api_key")
        tmdb_bearer_token = os.getenv("TMDB_BEARER_TOKEN") or raw_config.get("tmdb_bearer_token")
        twitch_client_id = os.getenv("TWITCH_CLIENT_ID") or raw_config.get("twitch_client_id")
        twitch_client_secret = os.getenv("TWITCH_CLIENT_SECRET") or raw_config.get("twitch_client_secret")
        kick_client_id = os.getenv("KICK_CLIENT_ID") or raw_config.get("kick_client_id")
        kick_client_secret = os.getenv("KICK_CLIENT_SECRET") or raw_config.get("kick_client_secret")
        github_token = os.getenv("GITHUB_TOKEN") or raw_config.get("github_token")
        youtube_api_key = os.getenv("YOUTUBE_API_KEY") or raw_config.get("youtube_api_key")
        webhook_secret = os.getenv("WEBHOOK_SECRET") or raw_config.get("webhook_secret")

        # Update raw_config with env overrides for dict compatibility
        raw_config.update({
            "token": token,
            "database_url": database_url,
            "tmdb_api_key": tmdb_api_key,
            "tmdb_bearer_token": tmdb_bearer_token,
            "twitch_client_id": twitch_client_id,
            "twitch_client_secret": twitch_client_secret,
            "kick_client_id": kick_client_id,
            "kick_client_secret": kick_client_secret,
            "github_token": github_token,
            "youtube_api_key": youtube_api_key,
            "webhook_secret": webhook_secret,
        })

        return cls(
            command_prefix=raw_config.get("command_prefix", "!"),
            command_suffix=raw_config.get("command_suffix", "_nova"),
            master_guilds=raw_config.get("master_guilds", {}),
            master_user_ids=raw_config.get("master_user_ids", []),
            permission_config=raw_config.get("permission_config", {}),
            tier_config=raw_config.get("tier_config", {}),
            stripe_config=raw_config.get("stripe_config", {}),
            token=token,
            database_url=database_url,
            tmdb_api_key=tmdb_api_key,
            tmdb_bearer_token=tmdb_bearer_token,
            twitch_client_id=twitch_client_id,
            twitch_client_secret=twitch_client_secret,
            kick_client_id=kick_client_id,
            kick_client_secret=kick_client_secret,
            github_token=github_token,
            youtube_api_key=youtube_api_key,
            webhook_secret=webhook_secret,
            _raw_data=raw_config
        )

    # Dictionary Compatibility Interface
    def get(self, key: str, default: Any = None) -> Any:
        """Safe dictionary get method for backward compatibility."""
        if hasattr(self, key) and key != "_raw_data":
            val = getattr(self, key)
            return val if val is not None else default
        return self._raw_data.get(key, default)

    def __getitem__(self, key: str) -> Any:
        if hasattr(self, key) and key != "_raw_data":
            val = getattr(self, key)
            if val is not None:
                return val
        return self._raw_data[key]

    def __setitem__(self, key: str, value: Any):
        if hasattr(self, key) and key != "_raw_data":
            setattr(self, key, value)
        self._raw_data[key] = value

    def __contains__(self, key: str) -> bool:
        return hasattr(self, key) or key in self._raw_data

    def to_dict(self) -> dict[str, Any]:
        """Convert configuration to dictionary."""
        return dict(self._raw_data)
