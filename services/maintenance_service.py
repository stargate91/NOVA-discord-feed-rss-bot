import asyncio
import discord
from db import monitor_repo
from logger import log

class MaintenanceService:
    """Service responsible for administrative maintenance, history resets, and channel purge operations."""

    def __init__(self, bot=None):
        self.bot = bot

    async def manual_check(self, monitor) -> tuple[bool, str]:
        """Force an immediate update check for a specific monitor instance."""
        if not monitor:
            log.warning("Manual check failed: Monitor not found.")
            return False, "Monitor not found in memory."

        try:
            log.info(f"Manual check triggered for monitor: {monitor.name}")

            # Streaming platforms (Twitch, Kick)
            if hasattr(monitor, '_fetch_platform_data'):
                stream_data = await monitor._fetch_platform_data()
                if stream_data and stream_data.get('is_live'):
                    viewers = stream_data.get('viewers', 0)
                    title = stream_data.get('title', 'No Title')
                    msg = f"LIVE NOW! {viewers:,} viewers. Title: {title}"
                    return True, msg
                else:
                    return True, "Currently OFFLINE."

            if hasattr(monitor, 'fetch_new_items'):
                all_items = await monitor.fetch_new_items()
                new_items = []
                if all_items:
                    for item in all_items:
                        item_id = monitor.get_item_id(item)
                        if item_id:
                            is_pub = await monitor_repo.is_published(item_id, monitor.platform, monitor.guild_id)
                            if not is_pub:
                                new_items.append(item)

                if new_items:
                    for item in new_items:
                        await monitor.process_item(item)
                    await monitor.mark_items_published(new_items)

                    count = len(new_items)
                    first = new_items[0]
                    title = first.get('title') or first.get('name') or first.get('symbol')

                    if monitor.platform == 'crypto' and first.get('price'):
                        msg = f"Price Alert! {title} is at ${first.get('price')}!"
                    elif title:
                        msg = f"Found {count} new update(s)! Latest: {title}"
                    else:
                        msg = f"Found {count} new update(s)!"
                    return True, msg
                else:
                    return True, "Checked successfully. No new updates found."
            else:
                await monitor.check_for_updates()
                return True, "Manual check complete."
        except Exception as e:
            log.error(f"Error during manual check for {monitor.name}: {e}")
            return False, f"Check error: {str(e)}"

    async def repost_recent(self, monitor, count: int = 1) -> bool:
        """Fetch latest items directly from source and post them."""
        if not monitor:
            return False

        count = max(1, min(10, int(count)))
        try:
            log.info(f"Live Repost triggered for {monitor.name} (Source: {monitor.platform}). Fetching {count} items...")
            if not hasattr(monitor, 'get_latest_items'):
                log.warning(f"Monitor {monitor.name} does not support live fetching.")
                return False

            items_to_post = await monitor.get_latest_items(count)
            if not items_to_post:
                log.warning(f"No items found at source for {monitor.name}")
                return False

            log.info(f"Posting {len(items_to_post)} items from source for {monitor.name}")
            for item_data in items_to_post:
                if item_data.get("empty"):
                    log.warning(f"Item is marked as empty, skipping post for {monitor.name}")
                    continue
                await monitor.send_update(content=item_data.get("content"), embed=item_data.get("embed"), view=item_data.get("view"))
                await asyncio.sleep(1) # Safety delay

            return True
        except Exception as e:
            log.error(f"Error during live repost for {monitor.name}: {e}", exc_info=True)
            return False

    async def reset_history(self, monitor) -> bool:
        """Clear the publication history in DB for a specific monitor."""
        if not monitor:
            return False

        try:
            log.info(f"Resetting history for monitor: {monitor.name}")
            await monitor_repo.reset_history(monitor.platform, monitor.guild_id)
            return True
        except Exception as e:
            log.error(f"Error during history reset for {monitor.name}: {e}")
            return False

    async def reset_all_history(self) -> bool:
        """Clear ALL publication history for ALL monitors in the entire DB."""
        try:
            log.warning("NUCLEAR ACTION: Resetting ALL publication history for ALL monitors!")
            await monitor_repo.reset_all_history()
            return True
        except Exception as e:
            log.error(f"Error during global history reset: {e}")
            return False

    async def factory_reset(self) -> bool:
        """Wipe all database tables for a clean slate."""
        try:
            log.critical("!!! FACTORY RESET INITIATED !!! Wiping all database tables.")
            await monitor_repo.factory_reset_tables()
            return True
        except Exception as e:
            log.error(f"Error during factory reset: {e}")
            return False

    async def cleanup_history(self, days: int = 60) -> int:
        """Delete publication history entries older than the retention threshold."""
        try:
            log.info(f"Manual data retention cleanup initiated (Threshold: {days} days)")
            return await monitor_repo.cleanup_old_history(days=days)
        except Exception as e:
            log.error(f"Error during data retention cleanup: {e}")
            return 0

    async def purge_channel(self, monitor, amount: int = 50) -> bool:
        """Delete recent messages in the target Discord channels of this monitor."""
        if not monitor or not self.bot:
            return False

        success = True
        log.info(f"Purging channels for monitor: {monitor.name} (Amount: {amount})")

        for channel_id in monitor.target_channels:
            try:
                channel = self.bot.get_channel(int(channel_id))
                if not channel:
                    channel = await self.bot.fetch_channel(int(channel_id))

                if channel:
                    bot_member = channel.guild.me
                    if not channel.permissions_for(bot_member).manage_messages:
                        log.warning(f"Skipping purge in channel {channel_id}: Bot lacks 'Manage Messages' permission.")
                        success = False
                        continue

                    try:
                        deleted = await channel.purge(limit=amount)
                        log.info(f"Purged {len(deleted)} messages in channel {channel_id}")
                    except discord.NotFound:
                        log.warning(f"Purge in channel {channel_id} encountered Unknown Message (404), continuing...")
                    except Exception as e:
                        log.error(f"Error during purge in channel {channel_id}: {e}")
                        success = False
            except Exception as e:
                log.error(f"Failed to access channel {channel_id} for purge: {e}")
                success = False

        return success
