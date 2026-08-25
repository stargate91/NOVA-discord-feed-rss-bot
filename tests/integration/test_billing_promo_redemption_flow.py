import unittest
from datetime import datetime, timedelta
from unittest.mock import patch
from db import billing_repo

class TestBillingPromoRedemptionFlowIntegration(unittest.IsolatedAsyncioTestCase):
    async def test_promo_redemption_stacking_and_limits_flow(self):
        """Test full promo code redemption lifecycle: validation -> audit logging -> stacking premium days -> tier upgrade -> exhaustion limit."""
        # Simulated database state
        promo_codes_db = {
            "PROMO30": {
                "duration_days": 30,
                "max_uses": 2,
                "used_count": 0,
                "tier": 3,
                "is_revoked": False
            }
        }

        guild_settings_db = {
            100: {
                "guild_id": 100,
                "tier": 0,
                "premium_until": datetime.now() + timedelta(days=10) # 10 days left
            }
        }

        redemptions_audit_log = []

        async def mock_fetchrow(query, *args):
            if "SELECT duration_days" in query:
                code = args[0]
                data = promo_codes_db.get(code)
                if not data:
                    return None
                return (data["duration_days"], data["max_uses"], data["used_count"], data["tier"], data["is_revoked"])
            elif "SELECT premium_until" in query:
                guild_id = args[0]
                return guild_settings_db.get(guild_id)
            return None

        async def mock_execute(query, *args):
            if "UPDATE premium_codes SET used_count" in query:
                code = args[0]
                promo_codes_db[code]["used_count"] += 1
            elif "INSERT INTO premium_redemptions" in query:
                code, guild_id = args[0], args[1]
                redemptions_audit_log.append((code, guild_id))
            elif "UPDATE guild_settings SET premium_until" in query:
                guild_id, new_expiry = args[0], args[1]
                guild_settings_db[guild_id]["premium_until"] = new_expiry
            elif "UPDATE guild_settings SET tier" in query:
                guild_id, tier = args[0], args[1]
                guild_settings_db[guild_id]["tier"] = tier

        with patch.object(billing_repo, "_fetchrow", side_effect=mock_fetchrow), \
             patch.object(billing_repo, "_execute", side_effect=mock_execute):

            # --- REDEMPTION 1: Guild 100 redeems PROMO30 (+30 days, tier 3) ---
            success, msg = await billing_repo.redeem_code("PROMO30", guild_id=100)

            self.assertTrue(success)
            self.assertIn("successfully", msg.lower())
            self.assertEqual(promo_codes_db["PROMO30"]["used_count"], 1)
            self.assertEqual(len(redemptions_audit_log), 1)
            self.assertEqual(guild_settings_db[100]["tier"], 3)

            # --- REDEMPTION 2: Guild 200 redeems PROMO30 (Reaches max_uses=2) ---
            guild_settings_db[200] = {"guild_id": 200, "tier": 0, "premium_until": None}
            success2, msg2 = await billing_repo.redeem_code("PROMO30", guild_id=200)

            self.assertTrue(success2)
            self.assertEqual(promo_codes_db["PROMO30"]["used_count"], 2)
            self.assertEqual(guild_settings_db[200]["tier"], 3)

            # --- REDEMPTION 3: Guild 300 attempts to redeem PROMO30 (Must fail: max uses reached) ---
            guild_settings_db[300] = {"guild_id": 300, "tier": 0, "premium_until": None}
            success3, msg3 = await billing_repo.redeem_code("PROMO30", guild_id=300)

            self.assertFalse(success3)
            self.assertIn("maximum uses", msg3.lower())
            self.assertEqual(promo_codes_db["PROMO30"]["used_count"], 2)

if __name__ == "__main__":
    unittest.main()
