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
        """Test Stripe checkout.session.completed event activates Tier 2 and updates guild settings."""
        mock_event = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_123",
                    "client_reference_id": "100",
                    "subscription": "sub_test_abc"
                }
            }
        }

        mock_full_session = MagicMock()
        mock_line_item = MagicMock()
        mock_line_item.price.id = "price_tier2_monthly"
        mock_full_session.line_items.data = [mock_line_item]

        with patch("stripe.Webhook.construct_event", return_value=mock_event), \
             patch("stripe.checkout.Session.retrieve", return_value=mock_full_session), \
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
            self.assertEqual(call_kwargs["tier"], 2)
            self.assertEqual(call_kwargs["stripe_subscription_id"], "sub_test_abc")
            self.assertIsNotNone(call_kwargs["premium_until"])

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
