import json
from datetime import datetime, timedelta, timezone
from logger import log
from db.connection import get_pool, _fetch, _fetchrow, _execute
from models import MonitorConfig

def _parse_monitor_row(row) -> MonitorConfig:
    """Helper to parse a database row tuple into a validated MonitorConfig domain model."""
    m = {
        "id": row[0],
        "guild_id": row[1],
        "type": row[2],
        "name": row[3],
        "discord_channel_id": row[4],
        "ping_role_id": row[5],
        "enabled": bool(row[6]),
        "last_post_at": row[8]
    }
    if row[7]:
        try:
            extra = json.loads(row[7])
            if "extra_settings" in extra and isinstance(extra["extra_settings"], dict):
                nested = extra.pop("extra_settings")
                extra.update(nested)
            m.update(extra)
        except Exception as e:
            log.warning(f"[MonitorRepo] Failed to parse extra_settings JSON for monitor {m['id']}: {e}")

    if "target_channels" not in m or not m["target_channels"]:
        m["target_channels"] = [m["discord_channel_id"]] if m["discord_channel_id"] else []

    if "target_roles" not in m or not m["target_roles"]:
        m["target_roles"] = [m["ping_role_id"]] if m["ping_role_id"] else []

    return MonitorConfig(**m)

async def get_all_monitors() -> list[MonitorConfig]:
    """Fetch all monitors from database."""
    q = "SELECT id, guild_id, type, name, discord_channel_id, ping_role_id, enabled, extra_settings, last_post_at FROM monitors"
    rows = await _fetch(q)
    return [_parse_monitor_row(row) for row in rows]

async def get_monitors_for_guild(guild_id: int) -> list[MonitorConfig]:
    """Fetch all monitors for a specific guild."""
    q = "SELECT id, guild_id, type, name, discord_channel_id, ping_role_id, enabled, extra_settings, last_post_at FROM monitors WHERE guild_id = $1"
    rows = await _fetch(q, guild_id)
    return [_parse_monitor_row(row) for row in rows]

async def update_last_post_at(monitor_id: int):
    """Update the last_post_at timestamp for a monitor."""
    q = "UPDATE monitors SET last_post_at = $1 WHERE id = $2"
    await _execute(q, datetime.now(timezone.utc), int(monitor_id))

async def update_monitor_name(monitor_id: int, new_name: str):
    """Update a monitor's display name."""
    q = "UPDATE monitors SET name = $1 WHERE id = $2"
    await _execute(q, new_name, int(monitor_id))

async def update_monitor_channel_id(monitor_id: int, new_channel_id: str):
    """Updates the channel_id inside the extra_settings JSON blob for a monitor."""
    res = await _fetchrow("SELECT extra_settings FROM monitors WHERE id = $1", int(monitor_id))
    if not res:
        return False

    settings = {}
    if res[0]:
        try:
            settings = json.loads(res[0])
        except Exception:
            settings = {}

    settings["channel_id"] = new_channel_id
    q = "UPDATE monitors SET extra_settings = $1 WHERE id = $2"
    await _execute(q, json.dumps(settings), int(monitor_id))
    return True

async def is_published(entry_id: str, platform: str, guild_id: int = 0) -> bool:
    """Check whether a specific item has already been published to a guild."""
    q = "SELECT 1 FROM published_entries_v2 WHERE entry_id = $1 AND platform = $2 AND guild_id = $3"
    row = await _fetchrow(q, str(entry_id), platform, guild_id)
    return row is not None

async def get_published_ids_bulk(entry_ids: list[str], platform: str, guild_id: int = 0) -> set[str]:
    """Efficiently check multiple entry IDs in a single query."""
    if not entry_ids:
        return set()
    str_ids = [str(eid) for eid in entry_ids if eid]
    if not str_ids:
        return set()
    q = "SELECT entry_id FROM published_entries_v2 WHERE platform = $1 AND guild_id = $2 AND entry_id = ANY($3)"
    rows = await _fetch(q, platform, guild_id, str_ids)
    return {r[0] for r in rows}

async def mark_as_published(
    entry_id: str,
    platform: str,
    feed_url: str = None,
    guild_id: int = 0,
    published_at=None,
    title: str = None,
    thumbnail_url: str = None,
    author_name: str = None
):
    """Record an item as published in the published_entries_v2 table."""
    if published_at is None:
        published_at = datetime.now(timezone.utc)

    q = """
        INSERT INTO published_entries_v2 (entry_id, platform, guild_id, feed_url, published_at, title, thumbnail_url, author_name) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        ON CONFLICT (entry_id, platform, guild_id) DO UPDATE SET
            title = EXCLUDED.title,
            thumbnail_url = EXCLUDED.thumbnail_url,
            author_name = EXCLUDED.author_name
    """
    await _execute(q, str(entry_id), platform, guild_id, feed_url, published_at, title, thumbnail_url, author_name)

async def mark_as_published_bulk(entries: list[dict]):
    """Record multiple items as published in bulk using executemany."""
    if not entries:
        return
    now = datetime.now(timezone.utc)
    pool = await get_pool()
    q = """
        INSERT INTO published_entries_v2 (entry_id, platform, guild_id, feed_url, published_at, title, thumbnail_url, author_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (entry_id, platform, guild_id) DO UPDATE SET
            title = EXCLUDED.title,
            thumbnail_url = EXCLUDED.thumbnail_url,
            author_name = EXCLUDED.author_name
    """
    records = [
        (
            str(e.get("entry_id")),
            e.get("platform"),
            int(e.get("guild_id", 0)),
            e.get("feed_url"),
            e.get("published_at") or now,
            e.get("title"),
            e.get("thumbnail_url"),
            e.get("author_name")
        )
        for e in entries
        if e.get("entry_id") and e.get("platform")
    ]
    if not records:
        return

    async with pool.acquire() as conn:
        await conn.executemany(q, records)

async def reset_history(platform: str, guild_id: int):
    """Delete publication history for a specific monitor / platform on a guild."""
    q = "DELETE FROM published_entries_v2 WHERE platform = $1 AND guild_id = $2"
    await _execute(q, platform, guild_id)

async def reset_all_history():
    """Delete ALL publication history across all monitors."""
    q = "DELETE FROM published_entries_v2"
    await _execute(q)

async def cleanup_old_history(days: int = 60) -> int:
    """Delete published entries older than the retention threshold (default: 60 days)."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    q = "DELETE FROM published_entries_v2 WHERE published_at < $1"
    res = await _execute(q, cutoff)
    try:
        deleted = int(res.split(" ")[-1])
        if deleted > 0:
            log.info(f"[DataRetention] Cleaned up {deleted} published entries older than {days} days.")
        return deleted
    except Exception:
        return 0

async def increment_post_stat(guild_id: int, platform: str):
    """Increment the daily post counter for a guild/platform."""
    now_date = datetime.now(timezone.utc).date()
    q = """
        INSERT INTO monitor_stats_daily (date, guild_id, platform, post_count)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (date, guild_id, platform) 
        DO UPDATE SET post_count = monitor_stats_daily.post_count + 1
    """
    await _execute(q, now_date, guild_id, platform)

# Explicit whitelist of tables permitted for factory reset
ALLOWED_RESET_TABLES = frozenset({
    "published_entries_v2",
    "monitors",
    "guild_settings",
    "premium_codes",
    "announcements",
    "bot_statuses",
    "monitor_stats_daily",
    "youtube_cache",
    "steam_cache",
})

async def factory_reset_tables(tables: set[str] | tuple[str, ...] | list[str] | None = None):
    """Truncate data tables for a clean slate using validated runtime whitelist."""
    target_tables = set(tables) if tables is not None else set(ALLOWED_RESET_TABLES)
    invalid_tables = target_tables - ALLOWED_RESET_TABLES
    if invalid_tables:
        raise ValueError(f"Unauthorized table(s) requested for factory reset: {invalid_tables}")

    sanitized_table_list = ", ".join(sorted(target_tables))
    q = f"TRUNCATE TABLE {sanitized_table_list} CASCADE"
    await _execute(q)

__all__ = [
    "get_all_monitors",
    "get_monitors_for_guild",
    "update_last_post_at",
    "update_monitor_name",
    "update_monitor_channel_id",
    "is_published",
    "get_published_ids_bulk",
    "mark_as_published",
    "mark_as_published_bulk",
    "reset_history",
    "reset_all_history",
    "cleanup_old_history",
    "increment_post_stat",
    "factory_reset_tables",
]
