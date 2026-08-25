import os
from datetime import datetime, timedelta
import stripe
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from fastapi.responses import RedirectResponse
from logger import log
from db import guild_repo
from api.dependencies import get_bot, get_stripe_config

router = APIRouter(tags=["Stripe"])

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    bot = Depends(get_bot),
    stripe_config: dict = Depends(get_stripe_config)
):
    """Handle incoming Stripe webhook events."""
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature")

    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        log.error(f"[STRIPE] Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        log.error(f"[STRIPE] Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        guild_id_str = session.get('client_reference_id')
        if not guild_id_str:
            log.error("[STRIPE] Missing client_reference_id (Guild ID) in session.")
            return {"status": "error"}

        guild_id = int(guild_id_str)
        subscription_id = session.get('subscription')

        # Retrieve full session to get line items
        full_session = stripe.checkout.Session.retrieve(session['id'], expand=['line_items'])
        if not full_session.line_items or not full_session.line_items.data:
            return {"status": "error"}

        price_id = full_session.line_items.data[0].price.id
        products = stripe_config.get("products", {})

        product_info = products.get(price_id, {"tier": 3, "days": 30})
        tier = product_info.get("tier", 3)
        days = product_info.get("days", 30)

        expiry = datetime.now() + timedelta(days=days + 2)  # Grace period

        await guild_repo.update_guild_settings(
            guild_id=guild_id,
            tier=tier,
            premium_until=expiry,
            stripe_subscription_id=subscription_id,
            bot=bot
        )
        log.info(f"[STRIPE] Activated Tier {tier} for guild {guild_id} (Sub: {subscription_id})")

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

        await guild_repo.update_guild_settings(guild_id=guild_id, tier=tier, bot=bot)
        log.info(f"[STRIPE] Updated Tier to {tier} for guild {guild_id} due to sub update.")

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        guild_id_str = subscription.get('metadata', {}).get('guild_id')
        if not guild_id_str:
            return {"status": "ignored"}

        guild_id = int(guild_id_str)
        await guild_repo.update_guild_settings(
            guild_id=guild_id,
            tier=0,
            premium_until=None,
            stripe_subscription_id=None,
            bot=bot
        )
        log.info(f"[STRIPE] Subscription deleted for guild {guild_id}. Reverted to Free.")

    return {"status": "success"}

@router.get("/checkout")
async def create_checkout(
    guild_id: str,
    tier: int,
    interval: str = "mo",
    stripe_config: dict = Depends(get_stripe_config)
):
    """Create a Stripe Checkout Session and redirect the user."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured on the bot.")

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
        raise HTTPException(status_code=400, detail=f"Price ID not configured for Tier {tier} ({interval})")

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
        raise HTTPException(status_code=500, detail="Failed to create checkout session")
