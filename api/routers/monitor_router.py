from fastapi import APIRouter, HTTPException, Depends
from api.dependencies import get_bot, verify_webhook_secret

router = APIRouter(tags=["Monitors"])

@router.post("/monitors/sync")
async def sync_monitors(bot = Depends(get_bot)):
    """Synchronize monitors and guild settings with database."""
    if not bot.monitor_manager:
        raise HTTPException(status_code=500, detail="Monitor Manager not initialized")

    await bot.reload_guild_settings_cache()
    success = await bot.monitor_manager.sync_with_db()
    if success:
        return {"status": "success", "message": "Monitors and settings synchronized with database"}
    else:
        raise HTTPException(status_code=500, detail="Failed to synchronize monitors")

@router.post("/monitors/{monitor_id}/check")
async def manual_check(
    monitor_id: int,
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    """Force an immediate update check for a specific monitor."""
    if not bot.monitor_manager:
        raise HTTPException(status_code=500, detail="Monitor Manager not initialized")

    success, message = await bot.monitor_manager.manual_check(monitor_id)
    if success:
        return {"status": "success", "message": message}
    else:
        raise HTTPException(status_code=400, detail=message)

@router.post("/monitors/{monitor_id}/repost")
async def repost_recent(
    monitor_id: int,
    count: int = 1,
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    """Fetch and repost the latest items for a monitor directly from source."""
    if not bot.monitor_manager:
        raise HTTPException(status_code=500, detail="Monitor Manager not initialized")

    success = await bot.monitor_manager.repost_recent(monitor_id, count)
    if success:
        return {"status": "success", "message": f"Reposted {count} items for monitor {monitor_id}"}
    else:
        raise HTTPException(status_code=400, detail="No history found or repost failed")

@router.post("/monitors/{monitor_id}/purge")
async def purge_channel(
    monitor_id: int,
    amount: int = 50,
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    """Purge recent messages in the assigned channels of a monitor."""
    if not bot.monitor_manager:
        raise HTTPException(status_code=500, detail="Monitor Manager not initialized")

    success = await bot.monitor_manager.purge_channel(monitor_id, amount)
    if success:
        return {"status": "success", "message": f"Purged messages in channels for monitor {monitor_id}"}
    else:
        raise HTTPException(status_code=400, detail="Purge failed")

@router.post("/monitors/{monitor_id}/reset")
async def reset_history(
    monitor_id: int,
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    """Reset published publication history for a single monitor."""
    if not bot.monitor_manager:
        raise HTTPException(status_code=500, detail="Monitor Manager not initialized")

    success = await bot.monitor_manager.reset_history(monitor_id)
    if success:
        return {"status": "success", "message": f"History reset for monitor {monitor_id}"}
    else:
        raise HTTPException(status_code=400, detail="Monitor not found or reset failed")

@router.post("/monitors/reset-all")
async def reset_all_history(
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    """Reset ALL publication history across all monitors globally."""
    if not bot.monitor_manager:
        raise HTTPException(status_code=500, detail="Monitor Manager not initialized")

    success = await bot.monitor_manager.reset_all_history()
    if success:
        return {"status": "success", "message": "ALL monitor history has been reset globally"}
    else:
        raise HTTPException(status_code=500, detail="Global reset failed")

@router.post("/admin/factory-reset")
async def factory_reset(
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    """Wipe all database tables and reload bot state."""
    if not bot.monitor_manager:
        raise HTTPException(status_code=500, detail="Monitor Manager not initialized")

    success = await bot.monitor_manager.factory_reset()
    if success:
        return {"status": "success", "message": "FACTORY RESET COMPLETE. All data has been wiped."}
    else:
        raise HTTPException(status_code=500, detail="Factory reset failed")
