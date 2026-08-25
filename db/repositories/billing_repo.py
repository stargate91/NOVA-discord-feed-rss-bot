from datetime import datetime, timedelta
from logger import log
from db.connection import _fetch, _fetchrow, _execute

async def add_premium_days(guild_id: int, days: int):
    """Adds premium days to a guild. If already has premium, it stacks."""
    res = await _fetchrow("SELECT premium_until FROM guild_settings WHERE guild_id = $1", guild_id)
    now = datetime.utcnow()

    if not res:
        new_expiry = now + timedelta(days=days)
        await _execute(
            "INSERT INTO guild_settings (guild_id, premium_until) VALUES ($1, $2)",
            guild_id, new_expiry
        )
    else:
        current_expiry = res['premium_until']
        if not current_expiry or current_expiry < now:
            new_expiry = now + timedelta(days=days)
        else:
            new_expiry = current_expiry + timedelta(days=days)
        await _execute(
            "UPDATE guild_settings SET premium_until = $2 WHERE guild_id = $1",
            guild_id, new_expiry
        )

    log.info(f"Premium updated for guild {guild_id}: +{days} days.")

async def log_payment(guild_id: int, session_id: str, price_id: str, amount: int, currency: str, status: str = "completed"):
    """Log a payment transaction."""
    q = """
        INSERT INTO payment_history (guild_id, stripe_session_id, price_id, amount_cents, currency, status)
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (stripe_session_id) DO NOTHING
    """
    await _execute(q, guild_id, session_id, price_id, amount, currency, status)

async def get_payment_history(guild_id: int) -> list:
    """Fetch payment history for a specific guild."""
    q = "SELECT id, stripe_session_id, price_id, amount_cents, currency, status, created_at FROM payment_history WHERE guild_id = $1 ORDER BY created_at DESC"
    rows = await _fetch(q, guild_id)
    return [
        {
            "id": r[0],
            "stripe_session_id": r[1],
            "price_id": r[2],
            "amount_cents": r[3],
            "currency": r[4],
            "status": r[5],
            "created_at": r[6]
        }
        for r in rows
    ]

async def redeem_code(code: str, guild_id: int):
    """Redeem a premium promo code for a guild."""
    res = await _fetchrow("SELECT duration_days, max_uses, used_count, tier, is_revoked FROM premium_codes WHERE code = $1", code)
    if not res:
        return False, "Invalid promo code."

    duration_days, max_uses, used_count, tier, is_revoked = res
    if is_revoked:
        return False, "This promo code has been revoked."

    if used_count >= max_uses:
        return False, "This promo code has reached its maximum uses."

    # Update code usage
    await _execute("UPDATE premium_codes SET used_count = used_count + 1 WHERE code = $1", code)
    # Log redemption
    await _execute("INSERT INTO premium_redemptions (code, guild_id) VALUES ($1, $2)", code, guild_id)
    # Add days to guild
    await add_premium_days(guild_id, duration_days)
    if tier:
        await _execute("UPDATE guild_settings SET tier = $2 WHERE guild_id = $1", guild_id, tier)

    return True, f"Successfully redeemed code for {duration_days} days of Tier {tier} premium!"
