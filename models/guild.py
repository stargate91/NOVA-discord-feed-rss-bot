from datetime import datetime
from typing import Any
from pydantic import Field
from models.base import DomainModel

class GuildSettings(DomainModel):
    """Domain model representing settings and configuration for a Discord Guild."""
    guild_id: int | None = None
    language: str = "en"
    admin_role_id: int = 0
    alert_templates: dict[str, str] = Field(default_factory=dict)
    premium_until: datetime | None = None
    refresh_interval: int | None = None
    tier: int = 0
    stripe_subscription_id: str | None = None
    custom_branding: str | None = None
    is_active: bool = True
    is_master: bool = False
    is_premium: bool = False

    @property
    def has_active_premium(self) -> bool:
        """Check if guild has valid premium subscription or active expiration."""
        if self.is_master:
            return True
        if self.tier >= 1:
            return True
        if self.premium_until and self.premium_until > datetime.now():
            return True
        return False

class TierLimits(DomainModel):
    """Domain model representing resource constraints for a subscription tier."""
    min_refresh_interval: int = 20
    max_monitors: int = 2
    max_channels: int = 1
    max_pings: int = 1
    max_purge: int = 10

    def __iter__(self):
        yield self.min_refresh_interval
        yield self.max_monitors
        yield self.max_channels
        yield self.max_pings
        yield self.max_purge

class GuildPermissionResponse(DomainModel):
    """API model for dashboard user permissions and tier overview."""
    is_admin: bool = False
    tier: int = 0
    tier_name: str = "Unknown"
    features: list[str] = Field(default_factory=list)
    limits: dict[str, Any] = Field(default_factory=dict)
    bot_in_guild: bool = False
