import unittest
from unittest.mock import MagicMock
from monitors.crypto_monitor import CryptoMonitor

class TestCryptoLogic(unittest.TestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k

    def test_parse_targets_string(self):
        """Verify parsing comma-separated crypto targets."""
        monitor = CryptoMonitor(self.bot, {"id": 1, "source_id": "BTC:100000, ETH: 3500.50, SOL:200"})
        expected = {
            "BTC": 100000.0,
            "ETH": 3500.50,
            "SOL": 200.0
        }
        self.assertEqual(monitor.targets, expected)

    def test_parse_targets_invalid_values(self):
        """Verify graceful handling of malformed symbol:target pairs."""
        monitor = CryptoMonitor(self.bot, {"id": 2, "source_id": "BTC:invalid, :500, ETH:4000"})
        self.assertEqual(monitor.targets, {"ETH": 4000.0})

    def test_empty_targets(self):
        """Verify empty string returns empty dictionary."""
        monitor = CryptoMonitor(self.bot, {"id": 3, "source_id": ""})
        self.assertEqual(monitor.targets, {})

if __name__ == "__main__":
    unittest.main()
