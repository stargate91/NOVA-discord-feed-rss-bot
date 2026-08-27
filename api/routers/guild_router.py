from fastapi import APIRouter, Depends, Path
from api.dependencies import get_bot, verify_webhook_secret, rate_limit
from models.api import GuildPermissionsResponse

router = APIRouter(tags=["Guilds"])

@router.get(
    "/guilds/{guild_id}/permissions/{user_id}",
    response_model=GuildPermissionsResponse,
    summary="Get user permissions & guild tier",
    description="Retrieve user administrative permissions, current guild tier, and enabled feature flags for web dashboard access."
)
async def get_permissions(
    guild_id: int = Path(..., description="Discord Guild ID"),
    user_id: int = Path(..., description="Discord User ID"),
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret),
    _rate_limited: bool = Depends(rate_limit),
):
    guild = bot.get_guild(guild_id)

    # 1. Base Tier Info (from DB / cache or master_guilds)
    is_master_guild = False
    if hasattr(bot, "is_master"):
        try:
            is_master_guild = bot.is_master(guild_id) is True
        except Exception:
            is_master_guild = False

    if is_master_guild:
        tier = 4
    else:
        settings = bot.guild_settings_cache.get(guild_id, {}) if hasattr(bot, "guild_settings_cache") and bot.guild_settings_cache else {}
        tier = settings.get("tier", 0) if isinstance(settings, dict) else getattr(settings, "tier", 0)
        if tier == 0 and hasattr(bot, "is_premium"):
            try:
                if bot.is_premium(guild_id) is True:
                    tier = 3
            except Exception:
                pass

    tier_config_all = bot.config.get("tier_config", {}) if hasattr(bot, "config") and bot.config else {}
    tier_info = tier_config_all.get(str(tier), tier_config_all.get("0", {}))

    # 2. Member Permissions (Requires bot in guild)
    is_admin = False
    bot_in_guild = False

    if guild:
        bot_in_guild = True
        member = guild.get_member(user_id)
        if not member:
            try:
                member = await guild.fetch_member(user_id)
            except Exception:
                member = None

        if member:
            is_admin = bot.is_bot_admin(member)

    return GuildPermissionsResponse(
        is_admin=is_admin,
        tier=tier,
        tier_name=tier_info.get("name", "Unknown"),
        features=tier_info.get("features", []),
        limits=tier_info,
        bot_in_guild=bot_in_guild
    )
