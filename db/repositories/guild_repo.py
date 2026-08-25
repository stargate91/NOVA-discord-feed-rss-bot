import json
from datetime import datetime
from logger import log
from db.connection import get_pool, _fetch, _fetchrow, _execute

async def get_guild_settings(guild_id: int) -> dict:
    """Retrieve settings for a specific guild."""
    q = """
        SELECT language, admin_role_id, alert_templates, premium_until, refresh_interval, 
               tier, stripe_subscription_id, custom_branding, is_active, is_master, is_premium
        FROM guild_settings 
        WHERE guild_id = $1
    """
    row = await _fetchrow(q, guild_id)
    if row:
        templates = {}
        if row[2]:
            try:
                templates = json.loads(row[2])
            except Exception:
                pass
        return {
            "language": row[0] or "en",
            "admin_role_id": row[1] or 0,
            "alert_templates": templates,
            "premium_until": row[3],
            "refresh_interval": row[4],
            "tier": row[5] or 0,
            "stripe_subscription_id": row[6],
            "custom_branding": row[7],
            "is_active": row[8] if row[8] is not None else True,
            "is_master": row[9] or False,
            "is_premium": row[10] or False
        }
    return {
        "language": "en",
        "admin_role_id": 0,
        "alert_templates": {},
        "premium_until": None,
        "refresh_interval": None,
        "tier": 0,
        "stripe_subscription_id": None,
        "custom_branding": None,
        "is_active": True,
        "is_master": False,
        "is_premium": False
    }

async def get_all_guild_settings() -> list:
    """Fetch settings for all guilds (used for cache warming)."""
    q = """
        SELECT guild_id, language, admin_role_id, alert_templates, premium_until, 
               tier, stripe_subscription_id, custom_branding, is_active, is_master, is_premium
        FROM guild_settings
    """
    rows = await _fetch(q)
    results = []
    for row in rows:
        templates = {}
        if row[3]:
            try:
                templates = json.loads(row[3])
            except Exception:
                pass
        results.append({
            "guild_id": row[0],
            "language": row[1] or "en",
            "admin_role_id": row[2] or 0,
            "alert_templates": templates,
            "premium_until": row[4],
            "tier": row[5] or 0,
            "stripe_subscription_id": row[6],
            "custom_branding": row[7],
            "is_active": row[8] if row[8] is not None else True,
            "is_master": row[9] or False,
            "is_premium": row[10] or False
        })
    return results

async def update_guild_settings(
    guild_id: int,
    lang=None,
    a_role=None,
    templates=None,
    p_until=None,
    r_int=None,
    g_tier=None,
    sub_id=None,
    bot=None,
    custom_branding=None
):
    """Upsert guild settings and update in-memory cache if bot instance is supplied."""
    curr = {}
    if bot and hasattr(bot, "guild_settings_cache"):
        curr = bot.guild_settings_cache.get(guild_id, {})
    else:
        row = await _fetchrow(
            """SELECT language, admin_role_id, alert_templates, premium_until, 
                      refresh_interval, tier, stripe_subscription_id, custom_branding 
               FROM guild_settings WHERE guild_id=$1""",
            guild_id
        )
        if row:
            curr = dict(row)

    lang = lang if lang is not None else curr.get("language", "en")
    a_role = a_role if a_role is not None else curr.get("admin_role_id", 0)

    if templates is None:
        templates = curr.get("alert_templates", {})
    elif isinstance(templates, str):
        try:
            templates = json.loads(templates)
        except Exception:
            templates = {}

    p_until = p_until if p_until is not None else curr.get("premium_until", None)
    r_int = r_int if r_int is not None else curr.get("refresh_interval", 20)
    g_tier = g_tier if g_tier is not None else curr.get("tier", 0)
    sub_id = sub_id if sub_id is not None else curr.get("stripe_subscription_id", None)
    custom_branding = custom_branding if custom_branding is not None else curr.get("custom_branding", {})

    q = """
        INSERT INTO guild_settings (guild_id, language, admin_role_id, alert_templates, premium_until, refresh_interval, tier, stripe_subscription_id, custom_branding)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (guild_id) DO UPDATE SET
            language = EXCLUDED.language,
            admin_role_id = EXCLUDED.admin_role_id,
            alert_templates = EXCLUDED.alert_templates,
            premium_until = EXCLUDED.premium_until,
            refresh_interval = EXCLUDED.refresh_interval,
            tier = EXCLUDED.tier,
            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
            custom_branding = EXCLUDED.custom_branding
    """
    await _execute(
        q,
        guild_id,
        lang,
        a_role,
        json.dumps(templates) if isinstance(templates, dict) else templates,
        p_until,
        r_int,
        g_tier,
        sub_id,
        json.dumps(custom_branding) if isinstance(custom_branding, dict) else custom_branding
    )

    if bot and hasattr(bot, "guild_settings_cache"):
        bot.guild_settings_cache[guild_id] = {
            "language": lang,
            "admin_role_id": a_role,
            "alert_templates": templates,
            "premium_until": p_until,
            "refresh_interval": r_int,
            "tier": g_tier,
            "stripe_subscription_id": sub_id,
            "custom_branding": custom_branding
        }
        log.info(f"Updated guild settings cache for {guild_id}")

async def ensure_guild_active(guild_id: int):
    """Ensure a guild is marked active in the database."""
    q = """
        INSERT INTO guild_settings (guild_id, is_active)
        VALUES ($1, true)
        ON CONFLICT (guild_id) DO UPDATE SET is_active = true
    """
    return await _execute(q, guild_id)

async def set_guild_inactive(guild_id: int):
    """Mark a guild as inactive in the database."""
    q = "UPDATE guild_settings SET is_active = false WHERE guild_id = $1"
    return await _execute(q, guild_id)
