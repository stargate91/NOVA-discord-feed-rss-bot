import unittest
from unittest.mock import MagicMock
from ui.layouts.games import generate_free_game_layout
from ui.layouts.news import generate_news_layout
from ui.layouts.media import generate_youtube_layout, generate_tmdb_layout, generate_stream_layout

class TestUILayouts(unittest.TestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_feedback.side_effect = lambda k, guild_id=None, **kwargs: k
        self.bot.parse_emoji_text.side_effect = lambda text: (text, None)
        self.bot.is_premium.return_value = False

    def test_generate_free_game_layout(self):
        """Verify Discord Components V2 Free Game Layout generation."""
        content, layout = generate_free_game_layout(
            bot=self.bot,
            guild_id=123,
            alert_text="Free Game Alert!",
            title="Half-Life 3",
            game_url="https://store.steampowered.com/app/123",
            image_url="https://cdn.example.com/hl3.jpg",
            worth="$59.99",
            giveaway_type="Game",
            expiry_ts=1700000000,
            accent_color=0x3d3f45
        )
        self.assertIn("Free Game Alert!", content)
        self.assertIn("https://store.steampowered.com/app/123", content)
        self.assertIsNotNone(layout)

    def test_generate_news_layout(self):
        """Verify Discord Components V2 News / RSS Layout generation."""
        content, layout = generate_news_layout(
            bot=self.bot,
            guild_id=123,
            alert_text="New Tech News:",
            title="AI Revolution in Gaming",
            url="https://news.example.com/ai-gaming",
            image_url="https://cdn.example.com/ai.jpg",
            author="TechEditor",
            published_ts=1700000000,
            accent_color=0x00aaff
        )
        self.assertIn("New Tech News:", content)
        self.assertIn("https://news.example.com/ai-gaming", content)
        self.assertIsNotNone(layout)

    def test_generate_youtube_layout(self):
        """Verify Discord Components V2 YouTube Layout generation."""
        content, layout = generate_youtube_layout(
            bot=self.bot,
            guild_id=123,
            alert_text="New Video Uploaded:",
            title="Epic Gameplay Video",
            url="https://youtube.com/watch?v=123",
            image_url="https://cdn.example.com/thumb.jpg",
            author="GamerPro",
            published_ts=1700000000,
            accent_color=0xff0000
        )
        self.assertIn("New Video Uploaded:", content)
        self.assertIn("https://youtube.com/watch?v=123", content)
        self.assertIsNotNone(layout)

    def test_generate_tmdb_layout(self):
        """Verify Discord Components V2 TMDb Layout generation."""
        content, layout = generate_tmdb_layout(
            bot=self.bot,
            guild_id=123,
            alert_text="New Movie Premiere:",
            title="Inception 2",
            url="https://tmdb.org/movie/999",
            backdrop_url="https://cdn.example.com/backdrop.jpg",
            poster_url="https://cdn.example.com/poster.jpg",
            score_text="8.9/10",
            genre_text="Sci-Fi, Thriller",
            release_date="2026-12-01",
            trailer_url="https://youtube.com/watch?v=trailer",
            accent_color=0x990000
        )
        self.assertIn("New Movie Premiere:", content)
        self.assertIn("https://tmdb.org/movie/999", content)
        self.assertIsNotNone(layout)

    def test_generate_stream_layout(self):
        """Verify Discord Components V2 Stream Layout generation."""
        content, layout = generate_stream_layout(
            bot=self.bot,
            guild_id=123,
            alert_text="Streamer is LIVE:",
            display_name="Ninja",
            title="Playing Final Fantasy!",
            url="https://twitch.tv/ninja",
            thumbnail_url="https://cdn.example.com/stream.jpg",
            profile_image_url="https://cdn.example.com/avatar.jpg",
            game="Final Fantasy XIV",
            viewers=15000,
            platform="twitch",
            accent_color=0x6441a5
        )
        self.assertIn("Streamer is LIVE:", content)
        self.assertIn("https://twitch.tv/ninja", content)
        self.assertIsNotNone(layout)

if __name__ == "__main__":
    unittest.main()
