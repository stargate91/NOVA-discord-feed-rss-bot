from datetime import datetime, date
from typing import Optional
from sqlalchemy import (
    BigInteger,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Date,
    Index,
    func
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    """SQLAlchemy 2.0 Declarative Base class for all database tables."""
    pass

class GuildSettingsTable(Base):
    __tablename__ = "guild_settings"

    guild_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    language: Mapped[str] = mapped_column(String(10), default="en")
    admin_role_id: Mapped[int] = mapped_column(BigInteger, default=0)
    alert_templates: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    premium_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    refresh_interval: Mapped[int] = mapped_column(Integer, default=20)
    tier: Mapped[int] = mapped_column(Integer, default=0)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_master: Mapped[bool] = mapped_column(Boolean, default=False)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    custom_branding: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class MonitorTable(Base):
    __tablename__ = "monitors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    discord_channel_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    ping_role_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    extra_settings: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_post_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class PublishedEntryTable(Base):
    __tablename__ = "published_entries_v2"

    entry_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    platform: Mapped[str] = mapped_column(String(50), primary_key=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    feed_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    title: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    author_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        Index("idx_published_entries_time", "published_at"),
    )

class BotStatusTable(Base):
    __tablename__ = "bot_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status_text: Mapped[str] = mapped_column(Text, nullable=False)

class BotSettingTable(Base):
    __tablename__ = "bot_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class PremiumCodeTable(Base):
    __tablename__ = "premium_codes"

    code: Mapped[str] = mapped_column(String(50), primary_key=True)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    max_uses: Mapped[int] = mapped_column(Integer, default=1)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    tier: Mapped[int] = mapped_column(Integer, default=3)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

class MonitorStatsDailyTable(Base):
    __tablename__ = "monitor_stats_daily"

    date: Mapped[date] = mapped_column(Date, primary_key=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    platform: Mapped[str] = mapped_column(String(50), primary_key=True)
    post_count: Mapped[int] = mapped_column(Integer, default=0)

class PaymentHistoryTable(Base):
    __tablename__ = "payment_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    stripe_session_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    price_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    amount_cents: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(10), default="usd")
    status: Mapped[str] = mapped_column(String(50), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

class PremiumRedemptionTable(Base):
    __tablename__ = "premium_redemptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    guild_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    redeemed_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

class AnnouncementTable(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="info")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

class YouTubeCacheTable(Base):
    __tablename__ = "youtube_cache"

    query: Mapped[str] = mapped_column(String(255), primary_key=True)
    channel_id: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    thumbnail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class SteamCacheTable(Base):
    __tablename__ = "steam_cache"

    query: Mapped[str] = mapped_column(String(255), primary_key=True)
    appid: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
