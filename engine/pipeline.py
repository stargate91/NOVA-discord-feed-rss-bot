from db import monitor_repo
from logger import log

class FeedPipeline:
    """Standardized ingestion pipeline: Fetch -> Bulk Deduplicate -> Dispatch -> Bulk Commit."""

    def __init__(self, bot=None):
        self.bot = bot

    async def process_group(self, key: str, monitors_in_group: list, interval_mins: int = 20):
        """Process a shared feed group centrally and distribute items to all subscribed monitors in bulk."""
        if not monitors_in_group:
            return

        primary = monitors_in_group[0]
        try:
            if hasattr(primary, 'fetch_new_items'):
                log.debug(f"[Pipeline] Fetching items for {len(monitors_in_group)} monitors tracking '{key}' (Interval: {interval_mins}m)")
                new_items = await primary.fetch_new_items()
                if not new_items:
                    return

                all_ids = [primary.get_item_id(item) for item in new_items if primary.get_item_id(item)]

                for mon in monitors_in_group:
                    try:
                        # 1. Bulk check which items are already published for this monitor's guild
                        published_ids = await monitor_repo.get_published_ids_bulk(all_ids, mon.platform, mon.guild_id)

                        # 2. Dispatch only unpublished items
                        unpublished_items = [item for item in new_items if mon.get_item_id(item) not in published_ids]

                        if not mon.is_first_run:
                            for item in unpublished_items:
                                try:
                                    await mon.process_item(item)
                                except Exception as e:
                                    log.error(f"[Pipeline] Error processing item for {mon.name}: {e}", exc_info=True)

                        # 3. Bulk mark all items published
                        if hasattr(mon, 'mark_items_published'):
                            await mon.mark_items_published(new_items)

                        if mon.is_first_run:
                            log.info(f"[Pipeline] Initial silent seed completed for {mon.name}")
                            mon.is_first_run = False
                    except Exception as e:
                        log.error(f"[Pipeline] Error distributing items to {mon.name}: {e}", exc_info=True)
            else:
                # Legacy fallback
                log.debug(f"[Pipeline] Processing legacy monitors for '{key}'")
                for mon in monitors_in_group:
                    await mon.check_for_updates()
        except Exception as e:
            log.error(f"[Pipeline] Error processing shared group '{key}': {e}", exc_info=True)

    async def process_unshared(self, monitor):
        """Process a single unshared monitor independently using bulk queries."""
        try:
            log.debug(f"[Pipeline] Checking unshared monitor: {monitor.name}")
            if hasattr(monitor, 'fetch_new_items'):
                new_items = await monitor.fetch_new_items()
                if not new_items:
                    return

                all_ids = [monitor.get_item_id(item) for item in new_items if monitor.get_item_id(item)]
                published_ids = await monitor_repo.get_published_ids_bulk(all_ids, monitor.platform, monitor.guild_id)
                to_process = [item for item in new_items if monitor.get_item_id(item) not in published_ids]

                if not monitor.is_first_run:
                    for item in to_process:
                        try:
                            await monitor.process_item(item)
                        except Exception as e:
                            log.error(f"[Pipeline] Error processing unshared item for {monitor.name}: {e}", exc_info=True)

                if hasattr(monitor, 'mark_items_published'):
                    await monitor.mark_items_published(new_items)

                if monitor.is_first_run:
                    log.info(f"[Pipeline] Initial silent seed completed for {monitor.name}")
                    monitor.is_first_run = False
            else:
                await monitor.check_for_updates()
        except Exception as e:
            log.error(f"[Pipeline] Error checking unshared monitor '{monitor.name}': {e}", exc_info=True)
