import os
import json
import re
from logger import log
from core.constants import DEFAULT_LANGUAGE

_EMOJI_PATTERN = re.compile(r"(<a?:[a-zA-Z0-9_]+:[0-9]+>)")

class LocalizationService:
    """Service responsible for loading, formatting, and retrieving localized messages."""

    def __init__(self, bot=None, default_lang: str | None = None):
        self.bot = bot
        self._default_lang = default_lang
        self.locales: dict[str, dict] = {}
        self.default_language_data: dict = {}

    @property
    def default_language(self) -> str:
        if self._default_lang:
            return self._default_lang
        if self.bot and hasattr(self.bot, "config"):
            return getattr(self.bot.config, "default_language", DEFAULT_LANGUAGE)
        return DEFAULT_LANGUAGE

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

        self.default_language_data = self.locales.get(self.default_language, self.locales.get("en", {}))
        log.info(f"Loaded {len(self.locales)} language packs (Default: {self.default_language.upper()}).")

    def get_feedback(self, key: str, guild_id: int | None = None, force_lang: str | None = None, **kwargs) -> str:
        """
        Get localized feedback text.
        Resolution priority:
        1. Explicit force_lang
        2. Configured guild language
        3. Configured bot default fallback language
        4. English master fallback
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
                lang_code = self.default_language

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

        match = _EMOJI_PATTERN.search(text)
        if match:
            emoji_str = match.group(1)
            clean_text = text.replace(emoji_str, "").strip()
            return clean_text, emoji_str

        return text, None
