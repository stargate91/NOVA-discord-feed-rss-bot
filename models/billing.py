from datetime import datetime
from models.base import DomainModel

class PaymentHistoryRecord(DomainModel):
    """Domain model representing a logged Stripe payment transaction."""
    id: int | None = None
    stripe_session_id: str
    price_id: str | None = None
    amount_cents: int = 0
    currency: str = "usd"
    status: str = "completed"
    created_at: datetime | None = None

class PromoCode(DomainModel):
    """Domain model representing a premium promotional redemption code."""
    code: str
    duration_days: int
    max_uses: int = 1
    used_count: int = 0
    tier: int = 1
    is_revoked: bool = False

class RedeemResult(DomainModel):
    """Domain model representing the outcome of a promo code redemption attempt."""
    success: bool
    message: str
    duration_days: int | None = None
    tier: int | None = None

    def __iter__(self):
        yield self.success
        yield self.message
