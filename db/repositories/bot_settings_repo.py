from db.connection import _fetch, _fetchrow, _execute

async def get_bot_setting(key: str, default=None):
    """Retrieve a global bot setting from the database."""
    q = "SELECT value FROM bot_settings WHERE key = $1"
    row = await _fetchrow(q, key)
    if row:
        return row[0]
    return default

async def set_bot_setting(key: str, value):
    """Upsert a global bot setting into the database."""
    q = """
        INSERT INTO bot_settings (key, value) VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    """
    await _execute(q, key, str(value))

async def get_bot_statuses() -> list:
    """Retrieve all configurable bot presence statuses."""
    q = "SELECT id, type, status_text FROM bot_statuses"
    rows = await _fetch(q)
    return [{"id": r[0], "type": r[1], "text": r[2]} for r in rows]

async def add_bot_status(activity_type: str, text: str):
    """Add a new bot presence status."""
    q = "INSERT INTO bot_statuses (type, status_text) VALUES ($1, $2)"
    await _execute(q, activity_type, text)

async def remove_bot_status(status_id: int):
    """Delete a bot presence status by ID."""
    q = "DELETE FROM bot_statuses WHERE id = $1"
    await _execute(q, int(status_id))

async def update_bot_status(status_id: int, activity_type: str, text: str):
    """Update an existing bot presence status."""
    q = "UPDATE bot_statuses SET type = $1, status_text = $2 WHERE id = $3"
    await _execute(q, activity_type, text, int(status_id))
