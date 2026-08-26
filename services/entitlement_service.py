from datetime import datetime
from models import TierLimits

class EntitlementService:
    """Service responsible for subscription tiers, limits, refresh intervals, and feature entitlement."""

    def __init__(self, bot=None, config: dict | None = None):
        self.bot = bot
        self._config = config or {}

    @property
    def config(self) -> dict:
        if self.bot and hasattr(self.bot, "config"):
            return self.bot.config
        return self._config

    def _get_guild_settings(self, guild_id: int) -> dict:
        if self.bot and hasattr(self.bot, "guild_settings_cache"):
            return self.bot.guild_settings_cache.get(guild_id, {})
        return {}

    def is_master(self, guild_id: int) -> bool:
        """Check if a guild is configured as a Master Guild in config.json."""
        master_guilds = self.config.get("master_guilds", {})
        return str(guild_id) in master_guilds

    def is_premium(self, guild_id: int) -> bool:
        """
        Check if a guild has active premium status.
        Evaluation order:
          1. Master Guilds: Implicitly granted unlimited Ultimate (Tier 3) status forever.
          2. Active Tier Level: Configured tier >= 1 in database/cache.
          3. Legacy/Direct Expiration: Checks if premium_until timestamp is in the future.
        """
        # 1. Master Guilds are automatically Premium Forever (Tier 3+)
        if self.is_master(guild_id):
            return True

        settings = self._get_guild_settings(guild_id)

        # 2. Check Tier Level
        if settings.get("tier", 0) >= 1:
            return True

        # 3. DB Source (Calculated from expiration date - Legacy support)
        p_until = settings.get("premium_until")
        if p_until:
            return p_until > datetime.now()

        return False

    def get_guild_tier_limits(self, guild_id: int) -> TierLimits:
        """
        Resolve resource limits (refresh interval, max monitors/channels/pings/purges)
        for a guild based on its active subscription tier configuration.
        """
        settings = self._get_guild_settings(guild_id)
        tier = settings.get("tier", 0)

        # Legacy fallback if tier is 0 but premium_until timestamp is still active
        if tier == 0 and self.is_premium(guild_id):
            tier = 3

        tier_config = self.config.get("tier_config", {})
        config = tier_config.get(str(tier), tier_config.get("0", {}))

        return TierLimits(
            min_refresh_interval=config.get("min_refresh_interval", 20),
            max_monitors=config.get("max_monitors", 2),
            max_channels=config.get("max_channels", 1),
            max_pings=config.get("max_pings", 1),
            max_purge=config.get("max_purge", 10)
        )

    def has_feature(self, guild_id: int, feature_name: str) -> bool:
        """Check if a guild has access to a specific premium feature based on config."""
        if self.is_master(guild_id):
            return True

        settings = self._get_guild_settings(guild_id)
        tier = settings.get("tier", 0)
        if tier == 0 and self.is_premium(guild_id):
            tier = 3

        tier_config = self.config.get("tier_config", {})
        config = tier_config.get(str(tier), tier_config.get("0", {}))
        features = config.get("features", [])

        return feature_name in features or feature_name == "basic"

    def get_guild_refresh_interval(self, guild_id: int) -> int:
        """Returns the configured refresh interval in minutes, validated against tier limits."""
        limits = self.get_guild_tier_limits(guild_id)
        settings = self._get_guild_settings(guild_id)

        ri = settings.get("refresh_interval", 20)
        if ri is not None and isinstance(ri, (int, float)):
            return max(limits.min_refresh_interval, int(ri))

        return max(limits.min_refresh_interval, 20)
