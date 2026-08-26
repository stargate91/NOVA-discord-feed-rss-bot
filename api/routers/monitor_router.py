from fastapi import APIRouter, HTTPException, Depends, Path, Query, status
from api.dependencies import get_bot, verify_webhook_secret, rate_limit
from models.api import ActionStatusResponse

router = APIRouter(tags=["Monitors"])

@router.post(
    "/monitors/sync",
    response_model=ActionStatusResponse,
    summary="Synchronize monitors from database",
    description="Trigger an in-memory monitor reload and synchronization from the PostgreSQL database."
)
async def sync_monitors(
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret),
    _rate_limited: bool = Depends(rate_limit),
):
    if not bot.monitor_manager:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Monitor Manager not initialized."
        )

    await bot.reload_guild_settings_cache()
    success = await bot.monitor_manager.sync_with_db()
    if success:
        return ActionStatusResponse(
            status="success",
            message="Monitors and settings synchronized with database"
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to synchronize monitors"
    )

@router.post(
    "/monitors/{monitor_id}/check",
    response_model=ActionStatusResponse,
    summary="Trigger immediate monitor check",
    description="Force an immediate update check for a specific monitor instance and publish any new items."
)
async def manual_check(
    monitor_id: int = Path(..., description="Unique Monitor ID"),
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    if not bot.monitor_manager:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Monitor Manager not initialized."
        )

    success, message = await bot.monitor_manager.manual_check(monitor_id)
    if success:
        return ActionStatusResponse(status="success", message=message)
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

@router.post(
    "/monitors/{monitor_id}/repost",
    response_model=ActionStatusResponse,
    summary="Repost recent feed items",
    description="Fetch and repost the latest items for a monitor directly from source to Discord."
)
async def repost_recent(
    monitor_id: int = Path(..., description="Unique Monitor ID"),
    count: int = Query(default=1, ge=1, le=10, description="Number of recent items to repost"),
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    if not bot.monitor_manager:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Monitor Manager not initialized."
        )

    success = await bot.monitor_manager.repost_recent(monitor_id, count)
    if success:
        return ActionStatusResponse(
            status="success",
            message=f"Reposted {count} items for monitor {monitor_id}"
        )
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No history found or repost failed"
    )

@router.post(
    "/monitors/{monitor_id}/purge",
    response_model=ActionStatusResponse,
    summary="Purge monitor channel messages",
    description="Purge recent messages in the assigned Discord channels of a monitor."
)
async def purge_channel(
    monitor_id: int = Path(..., description="Unique Monitor ID"),
    amount: int = Query(default=50, ge=1, le=100, description="Number of messages to purge"),
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    if not bot.monitor_manager:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Monitor Manager not initialized."
        )

    success = await bot.monitor_manager.purge_channel(monitor_id, amount)
    if success:
        return ActionStatusResponse(
            status="success",
            message=f"Purged messages in channels for monitor {monitor_id}"
        )
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Purge failed")

@router.post(
    "/monitors/{monitor_id}/reset",
    response_model=ActionStatusResponse,
    summary="Reset single monitor publication history",
    description="Clear the publication deduplication history in DB for a specific monitor."
)
async def reset_history(
    monitor_id: int = Path(..., description="Unique Monitor ID"),
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    if not bot.monitor_manager:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Monitor Manager not initialized."
        )

    success = await bot.monitor_manager.reset_history(monitor_id)
    if success:
        return ActionStatusResponse(
            status="success",
            message=f"History reset for monitor {monitor_id}"
        )
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Monitor not found or reset failed"
    )

@router.post(
    "/monitors/reset-all",
    response_model=ActionStatusResponse,
    summary="Reset all monitors publication history",
    description="Clear ALL publication history across all monitors in the entire database."
)
async def reset_all_history(
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    if not bot.monitor_manager:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Monitor Manager not initialized."
        )

    success = await bot.monitor_manager.reset_all_history()
    if success:
        return ActionStatusResponse(
            status="success",
            message="ALL monitor history has been reset globally"
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Global reset failed"
    )

@router.post(
    "/admin/factory-reset",
    response_model=ActionStatusResponse,
    summary="Factory reset database",
    description="Wipe all database tables and reload bot state for a completely clean slate."
)
async def factory_reset(
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    if not bot.monitor_manager:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Monitor Manager not initialized."
        )

    success = await bot.monitor_manager.factory_reset()
    if success:
        return ActionStatusResponse(
            status="success",
            message="FACTORY RESET COMPLETE. All data has been wiped."
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Factory reset failed"
    )
