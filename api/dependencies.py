import os
import hmac
import time
from collections import defaultdict, deque
from fastapi import Request, Header, HTTPException, status
from logger import log

class InMemoryRateLimiter:
    """Sliding-window rate limiter per client IP address."""
    def __init__(self, requests_limit: int = 120, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    def is_allowed(self, client_ip: str) -> tuple[bool, int]:
        now = time.time()
        window_start = now - self.window_seconds
        client_history = self.requests[client_ip]

        # Evict timestamps outside sliding window
        while client_history and client_history[0] < window_start:
            client_history.popleft()

        if len(client_history) >= self.requests_limit:
            retry_after = int(client_history[0] + self.window_seconds - now) + 1
            return False, max(1, retry_after)

        client_history.append(now)
        return True, 0

_default_rate_limiter = InMemoryRateLimiter(requests_limit=120, window_seconds=60)

def rate_limit(request: Request) -> bool:
    """FastAPI dependency to rate limit incoming API requests per client IP."""
    client_ip = request.client.host if request.client else "unknown"
    allowed, retry_after = _default_rate_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )
    return True

def get_bot(request: Request):
    """Dependency provider for the Discord bot instance stored on app.state."""
    if not hasattr(request.app.state, 'bot') or not request.app.state.bot:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Discord Bot instance is not ready or not initialized."
        )
    return request.app.state.bot

def get_stripe_config(request: Request) -> dict:
    """Dependency provider for the Stripe configuration dictionary."""
    return getattr(request.app.state, 'stripe_config', {})

def verify_webhook_secret(
    x_webhook_secret: str | None = Header(default=None, alias="X-Webhook-Secret")
) -> bool:
    """
    Validate internal RPC/webhook authorization secret header.
    - Uses constant-time comparison (hmac.compare_digest) against timing side-channel attacks.
    - Enforces fail-closed security: rejects requests if WEBHOOK_SECRET is unset (unless in explicit test mode).
    """
    expected_secret = os.getenv("WEBHOOK_SECRET")

    if not expected_secret:
        env_mode = os.getenv("ENVIRONMENT", "").lower()
        if env_mode in ("dev", "development", "test", "testing"):
            return True
        log.error("[Auth] WEBHOOK_SECRET is not configured in environment! Denying access.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Server authentication misconfigured: WEBHOOK_SECRET not set."
        )

    if not x_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing 'X-Webhook-Secret' authentication header."
        )

    if not hmac.compare_digest(x_webhook_secret.encode("utf-8"), expected_secret.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret."
        )

    return True

__all__ = [
    "get_bot",
    "get_stripe_config",
    "verify_webhook_secret",
    "rate_limit",
    "InMemoryRateLimiter",
]
