from models.base import DomainModel

class BotStatus(DomainModel):
    """Domain model representing a configurable Discord bot presence status."""
    id: int | None = None
    type: str
    text: str

class YouTubeCacheItem(DomainModel):
    """Domain model representing a cached YouTube channel resolution."""
    channel_id: str
    title: str
    thumbnail: str | None = None
