"""0001_initial_baseline

Revision ID: 0001_initial_baseline
Revises: 
Create Date: 2026-08-25 22:59:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_initial_baseline'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. guild_settings
    op.create_table(
        'guild_settings',
        sa.Column('guild_id', sa.BigInteger(), nullable=False),
        sa.Column('language', sa.String(length=10), server_default='en', nullable=False),
        sa.Column('admin_role_id', sa.BigInteger(), server_default='0', nullable=False),
        sa.Column('alert_templates', sa.Text(), nullable=True),
        sa.Column('premium_until', sa.DateTime(), nullable=True),
        sa.Column('refresh_interval', sa.Integer(), server_default='20', nullable=False),
        sa.Column('tier', sa.Integer(), server_default='0', nullable=False),
        sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('is_master', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('is_premium', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('custom_branding', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('guild_id')
    )

    # 2. monitors
    op.create_table(
        'monitors',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('guild_id', sa.BigInteger(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('discord_channel_id', sa.BigInteger(), nullable=True),
        sa.Column('ping_role_id', sa.BigInteger(), nullable=True),
        sa.Column('enabled', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('extra_settings', sa.Text(), nullable=True),
        sa.Column('last_post_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_monitors_guild', 'monitors', ['guild_id'], unique=False)

    # 3. published_entries_v2
    op.create_table(
        'published_entries_v2',
        sa.Column('entry_id', sa.String(length=255), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('guild_id', sa.BigInteger(), nullable=False),
        sa.Column('feed_url', sa.Text(), nullable=True),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('title', sa.Text(), nullable=True),
        sa.Column('thumbnail_url', sa.Text(), nullable=True),
        sa.Column('author_name', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('entry_id', 'platform', 'guild_id')
    )
    op.create_index('idx_published_entries_time', 'published_entries_v2', ['published_at'], unique=False)

    # 4. bot_statuses
    op.create_table(
        'bot_statuses',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('status_text', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. bot_settings
    op.create_table(
        'bot_settings',
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('key')
    )

    # 6. premium_codes
    op.create_table(
        'premium_codes',
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('duration_days', sa.Integer(), nullable=False),
        sa.Column('max_uses', sa.Integer(), server_default='1', nullable=False),
        sa.Column('used_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('tier', sa.Integer(), server_default='3', nullable=False),
        sa.Column('is_revoked', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('code')
    )

    # 7. monitor_stats_daily
    op.create_table(
        'monitor_stats_daily',
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('guild_id', sa.BigInteger(), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('post_count', sa.Integer(), server_default='0', nullable=False),
        sa.PrimaryKeyConstraint('date', 'guild_id', 'platform')
    )

    # 8. payment_history
    op.create_table(
        'payment_history',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('guild_id', sa.BigInteger(), nullable=False),
        sa.Column('stripe_session_id', sa.String(length=255), nullable=True),
        sa.Column('price_id', sa.String(length=255), nullable=True),
        sa.Column('amount_cents', sa.Integer(), server_default='0', nullable=False),
        sa.Column('currency', sa.String(length=10), server_default='usd', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='completed', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stripe_session_id')
    )

    # 9. premium_redemptions
    op.create_table(
        'premium_redemptions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('code', sa.String(length=50), nullable=True),
        sa.Column('guild_id', sa.BigInteger(), nullable=True),
        sa.Column('redeemed_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 10. announcements
    op.create_table(
        'announcements',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=50), server_default='info', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 11. youtube_cache
    op.create_table(
        'youtube_cache',
        sa.Column('query', sa.String(length=255), nullable=False),
        sa.Column('channel_id', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('thumbnail', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('query')
    )

    # 12. steam_cache
    op.create_table(
        'steam_cache',
        sa.Column('query', sa.String(length=255), nullable=False),
        sa.Column('appid', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('query')
    )

def downgrade() -> None:
    op.drop_table('steam_cache')
    op.drop_table('youtube_cache')
    op.drop_table('announcements')
    op.drop_table('premium_redemptions')
    op.drop_table('payment_history')
    op.drop_table('monitor_stats_daily')
    op.drop_table('premium_codes')
    op.drop_table('bot_settings')
    op.drop_table('bot_statuses')
    op.drop_index('idx_published_entries_time', table_name='published_entries_v2')
    op.drop_table('published_entries_v2')
    op.drop_index('idx_monitors_guild', table_name='monitors')
    op.drop_table('monitors')
    op.drop_table('guild_settings')
