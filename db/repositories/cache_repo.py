from db.connection import _fetchrow, _fetchval, _execute

async def get_steam_cached_id(query: str) -> str | None:
    """Retrieve cached Steam App ID for a query."""
    q = "SELECT appid FROM steam_cache WHERE query = $1"
    return await _fetchval(q, query.lower().strip())

async def cache_steam_id(query: str, appid: str, title: str):
    """Store Steam App ID resolution in cache."""
    q = """
        INSERT INTO steam_cache (query, appid, title, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (query) DO UPDATE SET 
            appid = EXCLUDED.appid,
            title = EXCLUDED.title,
            updated_at = CURRENT_TIMESTAMP
    """
    await _execute(q, query.lower().strip(), str(appid), title)

async def get_youtube_cached_id(query: str) -> dict | None:
    """Retrieve cached YouTube channel info for a query."""
    q = "SELECT channel_id, title, thumbnail FROM youtube_cache WHERE query = $1"
    row = await _fetchrow(q, query.lower().strip())
    if row:
        return {
            "channel_id": row[0],
            "title": row[1],
            "thumbnail": row[2]
        }
    return None

async def cache_youtube_channel(query: str, channel_id: str, title: str, thumbnail: str = None):
    """Store YouTube channel resolution in cache."""
    q = """
        INSERT INTO youtube_cache (query, channel_id, title, thumbnail, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (query) DO UPDATE SET 
            channel_id = EXCLUDED.channel_id,
            title = EXCLUDED.title,
            thumbnail = EXCLUDED.thumbnail,
            updated_at = CURRENT_TIMESTAMP
    """
    await _execute(q, query.lower().strip(), str(channel_id), title, thumbnail)
