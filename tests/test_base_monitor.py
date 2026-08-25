import unittest
from unittest.mock import MagicMock
from core.base_monitor import BaseMonitor

class DummyMonitor(BaseMonitor):
    def __init__(self, bot, config):
        super().__init__(bot, config)

    async def fetch_new_items(self) -> list:
        return [{"id": "dummy_1", "title": "Dummy Item"}]

    def get_item_id(self, item) -> str:
        return str(item.get("id"))

    async def process_item(self, item):
        pass

    async def get_latest_item(self):
        return {"id": "dummy_1", "title": "Dummy Item"}

class TestBaseMonitor(unittest.TestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_alert_template.return_value = "🔥 {author} posted: {title}! Check here: {url} {role}"

    def test_ping_role_formatting(self):
        """Verify role ID conversion to Discord mention string."""
        config = {
            "id": 1,
            "name": "Test Monitor",
            "target_roles": [111222333, 444555666]
        }
        monitor = DummyMonitor(self.bot, config)
        self.assertEqual(monitor.ping_role, "<@&111222333> <@&444555666>")

    def test_ping_role_empty(self):
        """Verify empty role list returns empty string."""
        config = {"id": 2, "name": "No Role Monitor", "target_roles": []}
        monitor = DummyMonitor(self.bot, config)
        self.assertEqual(monitor.ping_role, "")

    def test_get_alert_message_template_rendering(self):
        """Verify template string variable substitution."""
        config = {
            "id": 3,
            "name": "Tech Channel",
            "guild_id": 999,
            "target_roles": [12345]
        }
        monitor = DummyMonitor(self.bot, config)
        msg = monitor.get_alert_message({
            "title": "New Tech Breakthrough",
            "url": "https://tech.example.com",
            "author": "Tech Guy"
        })
        self.assertEqual(msg, "🔥 Tech Guy posted: New Tech Breakthrough! Check here: https://tech.example.com <@&12345>")

    def test_get_color_parsing(self):
        """Verify hex string and integer embed color parsing."""
        # Hex with hash
        m1 = DummyMonitor(self.bot, {"embed_color": "#ff5500"})
        self.assertEqual(m1.get_color(), 0xff5500)

        # Hex with 0x prefix
        m2 = DummyMonitor(self.bot, {"embed_color": "0x00ff00"})
        self.assertEqual(m2.get_color(), 0x00ff00)

        # Invalid hex fallback
        m3 = DummyMonitor(self.bot, {"embed_color": "INVALID_HEX"})
        self.assertEqual(m3.get_color(default_hex=0x3d3f45), 0x3d3f45)

    def test_get_image_url_custom_override(self):
        """Verify that custom_image takes precedence over default URL."""
        config = {"custom_image": "https://custom.cdn.com/logo.png"}
        monitor = DummyMonitor(self.bot, config)
        self.assertEqual(monitor.get_image_url("https://default.com/image.png"), "https://custom.cdn.com/logo.png")

        config_no_custom = {}
        monitor_default = DummyMonitor(self.bot, config_no_custom)
        self.assertEqual(monitor_default.get_image_url("https://default.com/image.png"), "https://default.com/image.png")

    def test_abstract_methods_enforced(self):
        """Verify that BaseMonitor cannot be instantiated directly or with missing abstract methods."""
        with self.assertRaises(TypeError):
            BaseMonitor(self.bot, {"id": 1})

        class IncompleteMonitor(BaseMonitor):
            pass

        with self.assertRaises(TypeError):
            IncompleteMonitor(self.bot, {"id": 2})

if __name__ == "__main__":
    unittest.main()
