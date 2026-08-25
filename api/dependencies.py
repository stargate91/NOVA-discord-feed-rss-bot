import os
from fastapi import Request, Header, HTTPException

def get_bot(request: Request):
    """Dependency provider for the Discord bot instance stored on app.state."""
    if not hasattr(request.app.state, 'bot') or not request.app.state.bot:
        raise HTTPException(status_code=500, detail="Bot instance not initialized")
    return request.app.state.bot

def get_stripe_config(request: Request) -> dict:
    """Dependency provider for the Stripe configuration dictionary."""
    return getattr(request.app.state, 'stripe_config', {})

def verify_webhook_secret(x_webhook_secret: str = Header(None)) -> bool:
    """Validate internal RPC/webhook authorization secret header."""
    expected_secret = os.getenv("WEBHOOK_SECRET")
    if not expected_secret:
        return True  # If no secret configured in env, allow for development/testing
    if x_webhook_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    return True
