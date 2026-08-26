import os
from datetime import datetime, timedelta
import stripe
from fastapi import APIRouter, Request, Header, HTTPException, Depends, Query, status
from fastapi.responses import RedirectResponse
from logger import log
from db import billing_repo, guild_repo
from db.connection import transaction
from api.dependencies import get_bot, get_stripe_config, rate_limit

router = APIRouter(tags=["Stripe Billing"])

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

@router.post(
    "/stripe/webhook",
    summary="Stripe payment webhook handler",
    description="Handle incoming Stripe events (checkout completion, subscription upgrades, cancellations) with HMAC signature validation."
)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature", description="Stripe signature header"),
    bot = Depends(get_bot),
    stripe_config: dict = Depends(get_stripe_config)
):
    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header"
        )

    try:
        raw_body = await request.body()
        event = stripe.Webhook.construct_event(
            raw_body,
            stripe_signature,
            STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        log.error(f"[STRIPE] Invalid payload: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload format")
    except stripe.error.SignatureVerificationError as e:
        log.error(f"[STRIPE] Invalid signature: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature verification")

    # --------------------------------------------------------------------------
    # Event 1: Checkout Session Completed (New Subscription or Upgrade)
    # --------------------------------------------------------------------------
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session.get('id')
        guild_id_str = session.get('client_reference_id')
        if not guild_id_str:
            log.error("[STRIPE] Missing client_reference_id (Guild ID) in session.")
            return {"status": "error", "reason": "missing_guild_id"}

        guild_id = int(guild_id_str)
        subscription_id = session.get('subscription')

        # Idempotency check: avoid double processing on duplicate webhook delivery
        if session_id and await billing_repo.is_session_processed(session_id):
            log.info(f"[STRIPE] Webhook session '{session_id}' already processed for guild {guild_id}. Skipping duplicate.")
            return {"status": "already_processed"}

        # Retrieve full line items to identify purchased price ID
        full_session = stripe.checkout.Session.retrieve(session['id'], expand=['line_items'])
        if not full_session.line_items or not full_session.line_items.data:
            return {"status": "error", "reason": "missing_line_items"}

        price_id = full_session.line_items.data[0].price.id
        products = stripe_config.get("products", {})

        # Resolve tier level and subscription duration from product configuration
        product_info = products.get(price_id, {"tier": 3, "days": 30})
        tier = product_info.get("tier", 3)
        days = product_info.get("days", 30)

        # Apply +2 days grace period to prevent abrupt cutoff on renewal lag
        expiry = datetime.now() + timedelta(days=days + 2)
        amount_cents = session.get('amount_total', 0)
        currency = session.get('currency', 'usd')

        # Atomic transaction boundary for payment audit logging and subscription activation
        async with transaction():
            if session_id:
                await billing_repo.log_payment(
                    guild_id=guild_id,
                    session_id=session_id,
                    price_id=price_id,
                    amount=amount_cents,
                    currency=currency,
                    status="completed"
                )
            await guild_repo.update_guild_settings(
                guild_id=guild_id,
                tier=tier,
                premium_until=expiry,
                stripe_subscription_id=subscription_id,
                bot=bot
            )
        log.info(f"[STRIPE] Activated Tier {tier} for guild {guild_id} (Sub: {subscription_id}, Payment logged: {session_id})")

    # --------------------------------------------------------------------------
    # Event 2: Customer Subscription Updated (Tier change or billing interval renewal)
    # --------------------------------------------------------------------------
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        guild_id_str = subscription.get('metadata', {}).get('guild_id')
        if not guild_id_str:
            return {"status": "ignored"}

        guild_id = int(guild_id_str)
        price_id = subscription['items']['data'][0]['price']['id']

        products = stripe_config.get("products", {})
        product_info = products.get(price_id, {"tier": 1})
        tier = product_info.get("tier", 1)

        # Persist updated tier level
        await guild_repo.update_guild_settings(guild_id=guild_id, tier=tier, bot=bot)
        log.info(f"[STRIPE] Updated Tier to {tier} for guild {guild_id} due to sub update.")

    # --------------------------------------------------------------------------
    # Event 3: Customer Subscription Deleted (Cancellation / Expiration)
    # --------------------------------------------------------------------------
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        guild_id_str = subscription.get('metadata', {}).get('guild_id')
        if not guild_id_str:
            return {"status": "ignored"}

        guild_id = int(guild_id_str)

        # Revert guild to Free Tier (Tier 0) and wipe active subscription ID
        await guild_repo.update_guild_settings(
            guild_id=guild_id,
            tier=0,
            premium_until=None,
            stripe_subscription_id=None,
            bot=bot
        )
        log.info(f"[STRIPE] Subscription deleted for guild {guild_id}. Reverted to Free.")

    return {"status": "success"}

@router.get(
    "/checkout",
    summary="Create Stripe checkout session",
    description="Initiate Stripe Subscription Checkout for a Discord Guild and redirect to Stripe portal."
)
async def create_checkout(
    guild_id: int = Query(..., ge=1000000000000000, le=99999999999999999999, description="Valid Discord Guild snowflake ID (17-20 digits)"),
    tier: int = Query(..., ge=1, le=3, description="Subscription tier level (1=Starter, 2=Pro, 3=Ultimate)"),
    interval: str = Query(default="mo", pattern="^(mo|yr)$", description="Billing interval ('mo' or 'yr')"),
    stripe_config: dict = Depends(get_stripe_config),
    _rate_limited: bool = Depends(rate_limit),
):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe payment gateway is not configured on this server."
        )

    products = stripe_config.get("products", {})
    price_id = None

    for pid, info in products.items():
        if info.get("tier") == tier and info.get("interval") == interval:
            price_id = pid
            break

    if not price_id:
        if tier == 1:
            price_id = os.getenv(f"STRIPE_PRICE_TIER1_{interval.upper()}")
        elif tier == 2:
            price_id = os.getenv(f"STRIPE_PRICE_TIER2_{interval.upper()}")
        elif tier == 3:
            price_id = os.getenv(f"STRIPE_PRICE_TIER3_{interval.upper()}")

    if not price_id:
        log.error(f"[CHECKOUT] Price not found for Tier {tier}, Interval {interval}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Price configuration not found for Tier {tier} ({interval})"
        )

    try:
        session = stripe.checkout.Session.create(
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            client_reference_id=guild_id,
            success_url=stripe_config.get("success_url"),
            cancel_url=stripe_config.get("cancel_url"),
            subscription_data={
                "metadata": {
                    "guild_id": guild_id
                }
            },
            metadata={
                "guild_id": guild_id,
                "tier": str(tier)
            }
        )
        return RedirectResponse(url=session.url)
    except Exception as e:
        log.error(f"[CHECKOUT] Error creating session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )
