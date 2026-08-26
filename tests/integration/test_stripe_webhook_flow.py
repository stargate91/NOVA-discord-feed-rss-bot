import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from starlette.testclient import TestClient
from core.webhook_server import app, setup_webhook_bot

class TestStripeWebhookIntegration(unittest.TestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.config = {
            "stripe_config": {
                "products": {
                    "price_tier2_monthly": {"tier": 2, "days": 30},
                    "price_tier3_yearly": {"tier": 3, "days": 365}
                }
            }
        }
        self.bot.guild_settings_cache = {
            100: {"tier": 0, "stripe_subscription_id": None, "premium_until": None}
        }
        self.bot.reload_guild_settings_cache = AsyncMock()

        setup_webhook_bot(self.bot)
        self.client = TestClient(app)

    def test_checkout_session_completed_activates_tier(self):
        """Test Stripe checkout.session.completed event activates Tier 2, logs payment, and updates guild settings."""
        mock_event = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_123",
                    "client_reference_id": "100",
                    "subscription": "sub_test_abc",
                    "amount_total": 999,
                    "currency": "usd"
                }
            }
        }

        mock_full_session = MagicMock()
        mock_line_item = MagicMock()
        mock_line_item.price.id = "price_tier2_monthly"
        mock_full_session.line_items.data = [mock_line_item]

        from contextlib import asynccontextmanager

        @asynccontextmanager
        async def dummy_tx():
            yield

        with patch("stripe.Webhook.construct_event", return_value=mock_event), \
             patch("stripe.checkout.Session.retrieve", return_value=mock_full_session), \
             patch("api.routers.stripe_router.transaction", side_effect=dummy_tx), \
             patch("db.billing_repo.is_session_processed", new_callable=AsyncMock, return_value=False), \
             patch("db.billing_repo.log_payment", new_callable=AsyncMock) as mock_log_payment, \
             patch("db.guild_repo.update_guild_settings", new_callable=AsyncMock) as mock_update_guild:

            resp = self.client.post(
                "/stripe/webhook",
                headers={"stripe-signature": "test_sig_val"},
                json=mock_event
            )

            self.assertEqual(resp.status_code, 200)
            mock_log_payment.assert_called_once_with(
                guild_id=100,
                session_id="cs_test_123",
                price_id="price_tier2_monthly",
                amount=999,
                currency="usd",
                status="completed"
            )
            mock_update_guild.assert_called_once()
            call_kwargs = mock_update_guild.call_args[1]
            self.assertEqual(call_kwargs["guild_id"], 100)
            self.assertEqual(call_kwargs["tier"], 2)
            self.assertEqual(call_kwargs["stripe_subscription_id"], "sub_test_abc")
            self.assertIsNotNone(call_kwargs["premium_until"])

    def test_checkout_session_completed_duplicate_idempotency(self):
        """Test duplicate checkout.session.completed events are safely skipped via idempotency check."""
        mock_event = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_duplicate_999",
                    "client_reference_id": "100"
                }
            }
        }

        with patch("stripe.Webhook.construct_event", return_value=mock_event), \
             patch("db.billing_repo.is_session_processed", new_callable=AsyncMock, return_value=True), \
             patch("db.guild_repo.update_guild_settings", new_callable=AsyncMock) as mock_update_guild:

            resp = self.client.post(
                "/stripe/webhook",
                headers={"stripe-signature": "test_sig_val"},
                json=mock_event
            )

            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json(), {"status": "already_processed"})
            mock_update_guild.assert_not_called()

    def test_subscription_deleted_downgrades_to_tier_0(self):
        """Test Stripe customer.subscription.deleted event downgrades guild to Tier 0."""
        mock_event = {
            "type": "customer.subscription.deleted",
            "data": {
                "object": {
                    "id": "sub_test_abc",
                    "metadata": {"guild_id": "100"}
                }
            }
        }

        with patch("stripe.Webhook.construct_event", return_value=mock_event), \
             patch("db.guild_repo.update_guild_settings", new_callable=AsyncMock) as mock_update_guild:

            resp = self.client.post(
                "/stripe/webhook",
                headers={"stripe-signature": "test_sig_val"},
                json=mock_event
            )

            self.assertEqual(resp.status_code, 200)
            mock_update_guild.assert_called_once()
            call_kwargs = mock_update_guild.call_args[1]
            self.assertEqual(call_kwargs["guild_id"], 100)
            self.assertEqual(call_kwargs["tier"], 0)
            self.assertIsNone(call_kwargs["stripe_subscription_id"])

if __name__ == "__main__":
    unittest.main()
