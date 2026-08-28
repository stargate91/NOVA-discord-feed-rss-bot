import unittest
from services.localization_service import LocalizationService

class TestLocalizationService(unittest.TestCase):
    def setUp(self):
        self.service = LocalizationService()
        self.service.load_locales(locales_dir="locales")

    def test_load_all_19_locales(self):
        """Verify that all 19 target language packs are loaded."""
        expected_locales = [
            "ar", "cs", "de", "en", "es", "fr", "he", "hu", "it",
            "ja", "ko", "nl", "pl", "pt", "ru", "sv", "tr", "zh", "zh-tw"
        ]
        for lang in expected_locales:
            self.assertIn(lang, self.service.locales, f"Locale '{lang}' missing in loaded locales!")

        self.assertEqual(len(self.service.locales), 19)

    def test_all_locales_have_matching_keys(self):
        """Verify that all 19 locales have exactly the same key set as English."""
        en_keys = set(self.service.locales["en"].keys())
        for lang_code, data in self.service.locales.items():
            lang_keys = set(data.keys())
            missing = en_keys - lang_keys
            extra = lang_keys - en_keys
            self.assertEqual(missing, set(), f"Locale '{lang_code}' is missing keys: {missing}")
            self.assertEqual(extra, set(), f"Locale '{lang_code}' has unexpected extra keys: {extra}")

    def test_get_feedback_default_resolution(self):
        """Test default resolution to configured default language (EN / HU)."""
        # Default fallback is EN
        res_default = self.service.get_feedback("default_unknown")
        self.assertEqual(res_default, "Unknown")

        # Explicit default_lang override
        hu_service = LocalizationService(default_lang="hu")
        hu_service.load_locales(locales_dir="locales")
        res_hu = hu_service.get_feedback("default_unknown")
        self.assertEqual(res_hu, "Ismeretlen")

    def test_get_feedback_forced_language(self):
        """Test explicit language override in get_feedback."""
        res_en = self.service.get_feedback("btn_read_more", force_lang="en")
        self.assertEqual(res_en, "Read More")

        res_de = self.service.get_feedback("btn_read_more", force_lang="de")
        self.assertEqual(res_de, "Mehr lesen")

        res_ja = self.service.get_feedback("btn_read_more", force_lang="ja")
        self.assertEqual(res_ja, "詳細を読む")

    def test_get_feedback_variable_interpolation(self):
        """Test replacing {variables} inside localized strings."""
        text = self.service.get_feedback("sync_success_guild", force_lang="en", count=5)
        self.assertIn("Successfully synced 5 command(s)", text)

        text_hu = self.service.get_feedback("sync_success_guild", force_lang="hu", count=12)
        self.assertIn("Sikeresen szinkronizálva 12 parancs", text_hu)

    def test_parse_emoji_text(self):
        """Test parsing custom Discord emojis from text strings."""
        clean, emoji = self.service.parse_emoji_text("<:fire:123456789> Super Hot Deal")
        self.assertEqual(clean, "Super Hot Deal")
        self.assertEqual(emoji, "<:fire:123456789>")

        # Animated emoji
        clean_a, emoji_a = self.service.parse_emoji_text("<a:animated_star:987654321> Star Alert")
        self.assertEqual(clean_a, "Star Alert")
        self.assertEqual(emoji_a, "<a:animated_star:987654321>")

        # Plain text with no emoji
        clean_plain, emoji_plain = self.service.parse_emoji_text("Just Plain Text")
        self.assertEqual(clean_plain, "Just Plain Text")
        self.assertIsNone(emoji_plain)

if __name__ == "__main__":
    unittest.main()
