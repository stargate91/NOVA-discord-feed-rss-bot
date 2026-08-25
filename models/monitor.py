from datetime import datetime
from typing import Any
from pydantic import Field
from models.base import DomainModel

class MonitorConfig(DomainModel):
    """Domain model representing a feed monitor configuration instance."""
    id: int | None = None
    guild_id: int = 0
    type: str = "unknown"
    name: str = "Unknown Monitor"
    discord_channel_id: int | None = None
    ping_role_id: int | None = None
    enabled: bool = True
    last_post_at: datetime | None = None
    target_channels: list[int] = Field(default_factory=list)
    target_roles: list[int] = Field(default_factory=list)
    embed_color: str | int | None = None
    custom_image: str | None = None
    extra_settings: dict[str, Any] = Field(default_factory=dict)

    @property
    def platform(self) -> str:
        """Alias for type to maintain cross-domain naming consistency."""
        return self.type

class PublishedRecord(DomainModel):
    """Domain model representing a historical published entry record."""
    entry_id: str
    platform: str
    guild_id: int
    feed_url: str | None = None
    title: str | None = None
    thumbnail_url: str | None = None
    author_name: str | None = None
    published_at: datetime | None = None
