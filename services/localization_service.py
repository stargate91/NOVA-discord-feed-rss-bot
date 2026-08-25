import os
import json
import re
from logger import log

class LocalizationService:
    """Service responsible for loading, formatting, and retrieving localized messages."""
    
    def __init__(self, bot=None):
        self.bot = bot
        self.locales: dict[str, dict] = {}
        self.default_language_data: dict = {}

    def load_locales(self, locales_dir: str = "locales"):
        """Load all language JSON files from the locales directory."""
        if os.path.exists(locales_dir):
            for filename in os.listdir(locales_dir):
                if filename.endswith(".json"):
                    lang_code = filename[:-5]
                    try:
                        with open(os.path.join(locales_dir, filename), "r", encoding="utf-8") as f:
                            self.locales[lang_code] = json.load(f)
                    except Exception as e:
                        log.error(f"Failed to load language file {filename}: {e}")
        
        self.default_language_data = self.locales.get("en", {})
        log.info(f"Loaded {len(self.locales)} language packs (Default: EN).")

    def get_feedback(self, key: str, guild_id: int | None = None, force_lang: str | None = None, **kwargs) -> str:
        """
        Get localized feedback text.
        Resolution priority:
        1. Explicit force_lang
        2. Configured guild language
        3. Fallback to 'hu' (Hungarian for feeds/cards)
        4. English default
        """
        guild_id = guild_id or 0
        settings = {}
        if self.bot and hasattr(self.bot, "guild_settings_cache"):
            settings = self.bot.guild_settings_cache.get(guild_id, {})

        if force_lang:
            lang_code = force_lang
        else:
            lang_code = settings.get("language")
            if not lang_code:
                lang_code = "hu"

        lang_data = self.locales.get(lang_code, self.locales.get("en", self.default_language_data))
        text = lang_data.get(key, self.default_language_data.get(key, key))
        
        if not isinstance(text, str):
            return text

        for k, v in kwargs.items():
            text = text.replace(f"{{{k}}}", str(v))
        return text

    def parse_emoji_text(self, text: str) -> tuple[str, str | None]:
        """
        Parses a string for custom Discord emojis (<:name:ID> or <a:name:ID>).
        Removes the emoji from the text and returns (clean_text, emoji_str).
        """
        if not isinstance(text, str):
            return text, None

        emoji_pattern = r"(<a?:[a-zA-Z0-9_]+:[0-9]+>)"
        match = re.search(emoji_pattern, text)
        if match:
            emoji_str = match.group(1)
            clean_text = text.replace(emoji_str, "").strip()
            return clean_text, emoji_str

        return text, None
