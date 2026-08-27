import json
from datetime import datetime
from typing import Any
from logger import log
from db.connection import _fetch, _fetchrow, _execute
from models import GuildSettings

async def get_guild_settings(guild_id: int) -> GuildSettings:
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
            except Exception as e:
                log.warning(f"[GuildRepo] Failed to parse alert_templates JSON for guild {guild_id}: {e}")
        return GuildSettings(
            guild_id=guild_id,
            language=row[0] or "en",
            admin_role_id=row[1] or 0,
            alert_templates=templates,
            premium_until=row[3],
            refresh_interval=row[4],
            tier=row[5] or 0,
            stripe_subscription_id=row[6],
            custom_branding=row[7],
            is_active=row[8] if row[8] is not None else True,
            is_master=row[9] or False,
            is_premium=row[10] or False
        )
    return GuildSettings(
        guild_id=guild_id,
        language="en",
        admin_role_id=0,
        alert_templates={},
        premium_until=None,
        refresh_interval=None,
        tier=0,
        stripe_subscription_id=None,
        custom_branding=None,
        is_active=True,
        is_master=False,
        is_premium=False
    )

async def get_all_guild_settings() -> list[GuildSettings]:
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
            except Exception as e:
                log.warning(f"[GuildRepo] Failed to parse alert_templates JSON for guild {row[0]}: {e}")
        results.append(GuildSettings(
            guild_id=row[0],
            language=row[1] or "en",
            admin_role_id=row[2] or 0,
            alert_templates=templates,
            premium_until=row[4],
            tier=row[5] or 0,
            stripe_subscription_id=row[6],
            custom_branding=row[7],
            is_active=row[8] if row[8] is not None else True,
            is_master=row[9] or False,
            is_premium=row[10] or False
        ))
    return results

async def update_guild_settings(
    guild_id: int,
    language: str | None = None,
    admin_role_id: int | None = None,
    alert_templates: dict | str | None = None,
    premium_until: datetime | None = None,
    refresh_interval: int | None = None,
    tier: int | None = None,
    stripe_subscription_id: str | None = None,
    bot: Any | None = None,
    custom_branding: dict | str | None = None,
    # Backward-compatibility alias kwargs
    lang: str | None = None,
    a_role: int | None = None,
    templates: dict | str | None = None,
    p_until: datetime | None = None,
    r_int: int | None = None,
    g_tier: int | None = None,
    sub_id: str | None = None,
):
    """Upsert guild settings and update in-memory cache if bot instance is supplied."""
    # Resolve aliases
    language = language or lang
    admin_role_id = admin_role_id if admin_role_id is not None else a_role
    alert_templates = alert_templates if alert_templates is not None else templates
    premium_until = premium_until if premium_until is not None else p_until
    refresh_interval = refresh_interval if refresh_interval is not None else r_int
    tier = tier if tier is not None else g_tier
    stripe_subscription_id = stripe_subscription_id if stripe_subscription_id is not None else sub_id

    curr = {}
    if bot and hasattr(bot, "guild_settings_cache"):
        cached = bot.guild_settings_cache.get(guild_id, {})
        if isinstance(cached, dict):
            curr = cached
        elif hasattr(cached, "__dict__"):
            curr = cached.__dict__
    else:
        row = await _fetchrow(
            """SELECT language, admin_role_id, alert_templates, premium_until, 
                      refresh_interval, tier, stripe_subscription_id, custom_branding 
               FROM guild_settings WHERE guild_id=$1""",
            guild_id
        )
        if row:
            curr = dict(row)

    resolved_language = language if language is not None else curr.get("language", "en")
    resolved_admin_role_id = admin_role_id if admin_role_id is not None else curr.get("admin_role_id", 0)

    if alert_templates is None:
        resolved_alert_templates = curr.get("alert_templates", {})
    elif isinstance(alert_templates, str):
        try:
            resolved_alert_templates = json.loads(alert_templates)
        except Exception:
            resolved_alert_templates = {}
    else:
        resolved_alert_templates = alert_templates

    resolved_premium_until = premium_until if premium_until is not None else curr.get("premium_until", None)
    resolved_refresh_interval = refresh_interval if refresh_interval is not None else curr.get("refresh_interval", 20)
    resolved_tier = tier if tier is not None else curr.get("tier", 0)
    resolved_stripe_subscription_id = stripe_subscription_id if stripe_subscription_id is not None else curr.get("stripe_subscription_id", None)
    resolved_custom_branding = custom_branding if custom_branding is not None else curr.get("custom_branding", {})

    q = """
        INSERT INTO guild_settings (
            guild_id, language, admin_role_id, alert_templates, 
            premium_until, refresh_interval, tier, stripe_subscription_id, 
            custom_branding, is_active, is_master, is_premium
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, false, false)
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
        resolved_language or "en",
        resolved_admin_role_id or 0,
        json.dumps(resolved_alert_templates) if isinstance(resolved_alert_templates, dict) else resolved_alert_templates,
        resolved_premium_until,
        resolved_refresh_interval or 20,
        resolved_tier or 0,
        resolved_stripe_subscription_id,
        json.dumps(resolved_custom_branding) if isinstance(resolved_custom_branding, dict) else resolved_custom_branding
    )

    if bot and hasattr(bot, "guild_settings_cache"):
        bot.guild_settings_cache[guild_id] = GuildSettings(
            guild_id=guild_id,
            language=resolved_language or "en",
            admin_role_id=resolved_admin_role_id or 0,
            alert_templates=resolved_alert_templates if isinstance(resolved_alert_templates, dict) else {},
            premium_until=resolved_premium_until,
            refresh_interval=resolved_refresh_interval,
            tier=resolved_tier or 0,
            stripe_subscription_id=resolved_stripe_subscription_id,
            custom_branding=resolved_custom_branding
        )
        log.info(f"Updated guild settings cache for {guild_id}")

async def ensure_guild_active(guild_id: int, default_lang: str = "en"):
    """Ensure a guild is marked active in the database with all non-null defaults."""
    q = """
        INSERT INTO guild_settings (guild_id, language, admin_role_id, refresh_interval, tier, is_active, is_master, is_premium)
        VALUES ($1, $2, 0, 20, 0, true, false, false)
        ON CONFLICT (guild_id) DO UPDATE SET is_active = true
    """
    return await _execute(q, guild_id, default_lang or "en")

async def set_guild_inactive(guild_id: int):
    """Mark a guild as inactive in the database."""
    q = "UPDATE guild_settings SET is_active = false WHERE guild_id = $1"
    return await _execute(q, guild_id)
