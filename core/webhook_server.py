from fastapi import FastAPI
from api.routers import stripe_router, monitor_router, guild_router, admin_router

app = FastAPI(title="Nova Webhook & Internal API Server")

# Register modular routers
app.include_router(stripe_router)
app.include_router(monitor_router)
app.include_router(guild_router)
app.include_router(admin_router)

@app.get("/health")
async def health():
    """Health check endpoint for container / load balancer monitoring."""
    return {"status": "ok"}

def setup_webhook_bot(bot_instance):
    """Link the FastAPI server to the running Discord bot instance."""
    app.state.bot = bot_instance
    app.state.stripe_config = bot_instance.config.get("stripe_config", {})
