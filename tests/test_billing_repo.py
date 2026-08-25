import unittest
from datetime import datetime, timedelta
from unittest.mock import MagicMock, AsyncMock, patch
from db import billing_repo

class TestBillingRepo(unittest.IsolatedAsyncioTestCase):
    async def test_redeem_code_not_found(self):
        """Verify handling non-existent promo code."""
        with patch("db.billing_repo._fetchrow", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = None
            success, msg = await billing_repo.redeem_code("INVALID_CODE", 100)
            self.assertFalse(success)
            self.assertIn("Invalid", msg)

    async def test_redeem_code_revoked(self):
        """Verify handling revoked promo code."""
        with patch("db.billing_repo._fetchrow", new_callable=AsyncMock) as mock_fetch:
            # duration_days, max_uses, used_count, tier, is_revoked
            mock_fetch.return_value = (30, 10, 2, 2, True)
            success, msg = await billing_repo.redeem_code("REVOKED_CODE", 100)
            self.assertFalse(success)
            self.assertIn("revoked", msg.lower())

    async def test_redeem_code_max_uses_reached(self):
        """Verify handling promo code with maximum uses reached."""
        with patch("db.billing_repo._fetchrow", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = (30, 5, 5, 2, False)
            success, msg = await billing_repo.redeem_code("EXHAUSTED_CODE", 100)
            self.assertFalse(success)
            self.assertIn("maximum", msg.lower())

    async def test_redeem_code_success(self):
        """Verify successful redemption updates usage, logs redemption, and grants premium."""
        with patch("db.billing_repo._fetchrow", new_callable=AsyncMock) as mock_fetch, \
             patch("db.billing_repo._execute", new_callable=AsyncMock) as mock_exec, \
             patch("db.billing_repo.add_premium_days", new_callable=AsyncMock) as mock_add_days:

            mock_fetch.return_value = (30, 10, 3, 2, False)
            success, msg = await billing_repo.redeem_code("VALID_CODE", 100)

            self.assertTrue(success)
            self.assertIn("successfully", msg.lower())
            mock_add_days.assert_called_once_with(100, 30)

if __name__ == "__main__":
    unittest.main()
