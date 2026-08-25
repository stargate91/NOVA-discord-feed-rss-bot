import unittest
from services.localization_service import LocalizationService
from ui import generate_news_layout

class TestDynamicLocaleSwitchingIntegration(unittest.TestCase):
    def setUp(self):
        self.loc_service = LocalizationService()
        self.loc_service.load_locales("locales")

        class MockBot:
            def __init__(self, loc):
                self.loc_service = loc
                self.guild_settings_cache = {
                    100: {"language": "hu"},
                    200: {"language": "en"},
                    300: {"language": "de"}
                }

            def get_feedback(self, key, guild_id=None, force_lang=None, **kwargs):
                return self.loc_service.get_feedback(key, guild_id=guild_id, force_lang=force_lang, **kwargs)

        self.bot = MockBot(self.loc_service)
        self.loc_service.bot = self.bot

    def test_instant_multilingual_layout_generation_across_guilds(self):
        """Test that different guilds receive distinct localized button text and messages based on their live settings."""
        # 1. Hungarian Guild (100)
        content_hu, layout_hu = generate_news_layout(
            bot=self.bot,
            guild_id=100,
            alert_text="Új Hír Megjelent",
            title="Magyar Cikk Címe",
            url="https://example.com/hu",
            image_url=None,
            author="Szerző",
            published_ts=1787659200,
            accent_color=0x3d3f45
        )
        self.assertIn("Új Hír Megjelent", content_hu)

        # 2. English Guild (200)
        content_en, layout_en = generate_news_layout(
            bot=self.bot,
            guild_id=200,
            alert_text="New Article Available",
            title="English Article Title",
            url="https://example.com/en",
            image_url=None,
            author="Author",
            published_ts=1787659200,
            accent_color=0x3d3f45
        )
        self.assertIn("New Article Available", content_en)

        # 3. Dynamic Hot-Switch: Guild 100 changes language from HU -> DE
        self.bot.guild_settings_cache[100]["language"] = "de"

        german_feedback = self.bot.get_feedback("monitor_twitch_live_title", guild_id=100, name="Gamer")
        self.assertIsNotNone(german_feedback)

        # 4. Dynamic Hot-Switch: Guild 100 changes language from DE -> FR
        self.bot.guild_settings_cache[100]["language"] = "fr"
        french_feedback = self.bot.get_feedback("monitor_twitch_live_title", guild_id=100, name="Gamer")
        self.assertIsNotNone(french_feedback)

if __name__ == "__main__":
    unittest.main()
