import os
import time
import aiohttp
import urllib.parse
import base64
from typing import Any
from fastapi import APIRouter, HTTPException, Header, Depends, status
from pydantic import BaseModel
from logger import log
from api.dependencies import get_bot, rate_limit

router = APIRouter(tags=["Authentication & Users"])

class DiscordOAuthExchangePayload(BaseModel):
    code: str
    redirect_uri: str | None = None

class RefreshTokenPayload(BaseModel):
    refresh_token: str

# In-memory user cache: token -> (user_dict, timestamp)
_user_cache: dict[str, tuple[dict[str, Any], float]] = {}
USER_CACHE_TTL = 300  # 5 minutes

# In-memory code exchange cache (idempotency guard against duplicate requests)
_code_exchange_cache: dict[str, tuple[dict[str, Any], float]] = {}
CODE_CACHE_TTL = 60  # 1 minute

async def fetch_discord_user(access_token: str) -> dict[str, Any]:
    """Fetch Discord user profile from Discord API with TTL caching."""
    now = time.time()
    if access_token in _user_cache:
        cached_user, ts = _user_cache[access_token]
        if now - ts < USER_CACHE_TTL:
            return cached_user

    async with aiohttp.ClientSession() as session:
        headers = {"Authorization": f"Bearer {access_token}"}
        async with session.get("https://discord.com/api/v10/users/@me", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                user = {
                    "id": data["id"],
                    "username": data["username"],
                    "discriminator": data.get("discriminator", "0"),
                    "global_name": data.get("global_name") or data["username"],
                    "avatar": data.get("avatar"),
                    "banner": data.get("banner"),
                    "accent_color": data.get("accent_color"),
                    "email": data.get("email"),
                }
                _user_cache[access_token] = (user, now)
                return user
            elif resp.status == 401:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Discord access token"
                )
            else:
                text = await resp.text()
                log.error(f"[Auth] Failed to fetch Discord user: {resp.status} - {text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to authenticate with Discord API"
                )

@router.post(
    "/auth/discord",
    summary="Exchange Discord OAuth2 Authorization Code",
    description="Exchanges OAuth2 authorization code for Discord access tokens and user profile."
)
async def exchange_discord_code(
    payload: DiscordOAuthExchangePayload,
    bot = Depends(get_bot),
    _rate_limited: bool = Depends(rate_limit),
):
    now = time.time()

    # Idempotency Check: Return cached response if same code was already exchanged in the last 60s
    if payload.code in _code_exchange_cache:
        cached_auth, ts = _code_exchange_cache[payload.code]
        if now - ts < CODE_CACHE_TTL:
            return cached_auth

    client_id = getattr(bot.config, "discord_client_id", None) or os.getenv("DISCORD_CLIENT_ID")
    client_secret = getattr(bot.config, "discord_client_secret", None) or os.getenv("DISCORD_CLIENT_SECRET")
    redirect_uri = payload.redirect_uri or getattr(bot.config, "discord_redirect_uri", None) or os.getenv("DISCORD_REDIRECT_URI", "http://localhost:3000/auth/callback")

    if not client_id or not client_secret:
        log.error("[Auth] DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET is missing!")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Discord OAuth2 credentials not configured on backend."
        )

    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "authorization_code",
        "code": payload.code,
        "redirect_uri": redirect_uri,
    }
    encoded_data = urllib.parse.urlencode(data)
    basic_auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {basic_auth}",
    }

    async with aiohttp.ClientSession() as session:
        async with session.post("https://discord.com/api/v10/oauth2/token", data=encoded_data, headers=headers) as resp:
            try:
                token_data = await resp.json()
            except Exception:
                raw_text = await resp.text()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Discord OAuth error ({resp.status}): {raw_text}"
                )

            if resp.status != 200 or "access_token" not in token_data:
                err_code = token_data.get("error", "unknown_error")
                err_desc = token_data.get("error_description", "")
                full_msg = f"{err_code}: {err_desc}" if err_desc else err_code
                log.error(f"[Auth] Discord token exchange failed ({resp.status}): {token_data}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Discord OAuth Error [{resp.status}]: {full_msg} (Redirect URI: {redirect_uri})"
                )

    access_token = token_data["access_token"]
    user = await fetch_discord_user(access_token)
    log.info(f"[Auth] Successfully authenticated Discord user: {user.get('username')} (ID: {user.get('id')})")

    result = {
        "access_token": access_token,
        "token_type": token_data.get("token_type", "Bearer"),
        "expires_in": token_data.get("expires_in", 604800),
        "refresh_token": token_data.get("refresh_token"),
        "user": user,
    }

    _code_exchange_cache[payload.code] = (result, now)
    return result

@router.post(
    "/auth/refresh",
    summary="Refresh Discord OAuth2 Access Token",
    description="Refreshes an expired Discord access token using a valid refresh token."
)
async def refresh_discord_token(
    payload: RefreshTokenPayload,
    bot = Depends(get_bot),
    _rate_limited: bool = Depends(rate_limit),
):
    client_id = getattr(bot.config, "discord_client_id", None) or os.getenv("DISCORD_CLIENT_ID")
    client_secret = getattr(bot.config, "discord_client_secret", None) or os.getenv("DISCORD_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Discord OAuth2 credentials not configured on backend."
        )

    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "refresh_token",
        "refresh_token": payload.refresh_token,
    }
    encoded_data = urllib.parse.urlencode(data)
    basic_auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {basic_auth}",
    }

    async with aiohttp.ClientSession() as session:
        async with session.post("https://discord.com/api/v10/oauth2/token", data=encoded_data, headers=headers) as resp:
            token_data = await resp.json()
            if resp.status != 200 or "access_token" not in token_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to refresh Discord access token"
                )

    return {
        "access_token": token_data["access_token"],
        "token_type": token_data.get("token_type", "Bearer"),
        "expires_in": token_data.get("expires_in", 604800),
        "refresh_token": token_data.get("refresh_token"),
    }

@router.get(
    "/users/@me",
    summary="Get Authenticated User Profile",
    description="Returns the currently authenticated user's Discord identity profile."
)
async def get_current_user(
    authorization: str | None = Header(default=None),
    _rate_limited: bool = Depends(rate_limit),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )

    access_token = authorization[7:].strip()
    return await fetch_discord_user(access_token)

@router.get(
    "/users/@me/guilds",
    summary="Get Manageable Discord Servers",
    description="Lists the user's Discord servers with administrative permissions and bot presence status."
)
async def get_user_guilds(
    authorization: str | None = Header(default=None),
    bot = Depends(get_bot),
    _rate_limited: bool = Depends(rate_limit),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )

    access_token = authorization[7:].strip()

    async with aiohttp.ClientSession() as session:
        headers = {"Authorization": f"Bearer {access_token}"}
        async with session.get("https://discord.com/api/v10/users/@me/guilds", headers=headers) as resp:
            if resp.status != 200:
                err_text = await resp.text()
                log.error(f"[Auth] Discord /users/@me/guilds failed: {resp.status} - {err_text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Failed to fetch guilds from Discord API: {err_text}"
                )
            discord_guilds = await resp.json()

    result = []
    # Query database for all monitors count grouped by guild_id
    from db.connection import _fetch
    monitor_counts = {}
    try:
        rows = await _fetch("SELECT guild_id, COUNT(*) FROM monitors GROUP BY guild_id")
        for row in rows:
            monitor_counts[str(row[0])] = row[1]
    except Exception as e:
        log.warning(f"[Auth] Could not fetch monitor counts: {e}")

    for g in discord_guilds:
        raw_perms = g.get("permissions", 0)
        try:
            perms = int(raw_perms) if raw_perms is not None else 0
        except (ValueError, TypeError):
            perms = 0

        is_owner = bool(g.get("owner", False))
        has_manage_guild = bool(perms & 0x20)
        has_admin = bool(perms & 0x8)
        can_manage = is_owner or has_manage_guild or has_admin

        if not can_manage:
            continue

        guild_id_int = int(g["id"])
        bot_guild = bot.get_guild(guild_id_int)
        bot_in_guild = bot_guild is not None

        # Resolve tier safely
        tier = 0
        settings = None
        try:
            if hasattr(bot, "guild_settings_cache") and bot.guild_settings_cache:
                settings = bot.guild_settings_cache.get(guild_id_int, {})
            if isinstance(settings, dict):
                tier = settings.get("tier", 0)
            elif settings is not None:
                tier = getattr(settings, "tier", 0)
            if tier == 0 and hasattr(bot, "is_premium") and bot.is_premium(guild_id_int):
                tier = 3
        except Exception as e:
            log.warning(f"[Auth] Tier resolution fallback for guild {guild_id_int}: {e}")

        # Resolve tier limits safely
        max_monitors = 2
        try:
            tier_config = bot.config.get("tier_config", {}).get(str(tier), {})
            max_monitors = tier_config.get("max_monitors", 2)
        except Exception:
            pass

        # Resolve refresh interval safely
        refresh_interval = 1200
        try:
            if hasattr(bot, "get_guild_refresh_interval"):
                refresh_interval = bot.get_guild_refresh_interval(guild_id_int) * 60
        except Exception:
            pass

        language = "en"
        if settings is not None:
            language = getattr(settings, "language", "en") if not isinstance(settings, dict) else settings.get("language", "en")

        active_monitors = monitor_counts.get(str(g["id"]), 0)

        result.append({
            "id": str(g["id"]),
            "guild_id": str(g["id"]),
            "name": g["name"],
            "icon": g.get("icon"),
            "owner": is_owner,
            "is_owner": is_owner,
            "permissions": str(perms),
            "hasManagePermission": can_manage,
            "tier": tier,
            "active_monitors": active_monitors,
            "monitorsCount": active_monitors,
            "max_monitors": max_monitors,
            "refresh_interval": refresh_interval,
            "language": language,
            "bot_in_guild": bot_in_guild,
        })

    log.info(f"[Auth] Returned {len(result)} manageable guilds for user")
    return result

__all__ = ["router"]
