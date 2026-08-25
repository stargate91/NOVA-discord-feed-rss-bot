from datetime import datetime
from typing import Any
from pydantic import Field
from models.base import DomainModel

class FeedItem(DomainModel):
    """Domain model representing an extracted feed or notification event item."""
    id: str
    title: str
    url: str | None = None
    thumbnail_url: str | None = None
    author: str | None = None
    published_at: datetime | None = None
    data: dict[str, Any] = Field(default_factory=dict)

class BroadcastPayload(DomainModel):
    """Domain model representing a rendered notification ready for Discord dispatch."""
    content: str | None = None
    title: str | None = None
    url: str | None = None
    view: Any = None
    embed: Any = None
    guild_id: int | None = None
