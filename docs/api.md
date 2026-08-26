# Nova REST API Documentation (`v1`)

The Nova Discord Feed Bot exposes an internal RESTful API and webhook integration interface built on FastAPI.

Interactive Swagger/OpenAPI documentation is available at:
- **Swagger UI**: `http://localhost:8080/docs`
- **ReDoc**: `http://localhost:8080/redoc`
- **OpenAPI JSON**: `http://localhost:8080/openapi.json`

---

## 1. Authentication & Security

Administrative and privileged endpoints require internal RPC authentication via HTTP Header.

| Header Name | Type | Description |
| :--- | :--- | :--- |
| `X-Webhook-Secret` | `string` | Secret authentication key matching `WEBHOOK_SECRET` environment variable |

- **Constant-Time Verification**: Uses `hmac.compare_digest` to mitigate timing attacks.
- **Fail-Closed Policy**: If `WEBHOOK_SECRET` is unset in production, requests are denied with `401 Unauthorized`.
- **Rate Limiting**: All API endpoints enforce a sliding-window rate limit (120 requests/minute per client IP). Exceeding this limit returns `429 Too Many Requests` with a `Retry-After` header.

---

## 2. API Endpoints

### Health & Readiness

#### `GET /health` & `GET /api/v1/health`
Performs readiness check on the bot process and tests PostgreSQL connection pool latency.

- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": {
    "status": "healthy",
    "latency_ms": 1.45,
    "pool": {
      "active_connections": 1,
      "free_connections": 9,
      "total_connections": 10
    }
  }
}
```

---

### Administration & Telemetry

#### `GET /api/v1/admin/logs`
Retrieves filtered structured logs from the in-memory circular ring buffer for Dev Panel dashboards.

- **Auth**: `X-Webhook-Secret` required
- **Query Parameters**:
  - `limit` (*optional int*, default `100`, max `500`): Maximum entries to return.
  - `level` (*optional str*): `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.
  - `guild_id` (*optional int*): Filter by Discord Guild ID.
  - `platform` (*optional str*): Filter by provider (`youtube`, `twitch`, `steam`, etc.).
  - `search` (*optional str*): Substring text search.
- **Response `200 OK`**:
```json
{
  "count": 1,
  "filters": {
    "level": "ERROR",
    "guild_id": null,
    "platform": null,
    "search": null,
    "limit": 100
  },
  "logs": [
    {
      "timestamp": "2026-08-27 01:00:00",
      "level": "ERROR",
      "logger": "FeedBot",
      "message": "YouTube API quota exceeded",
      "guild_id": 123456789012345678,
      "platform": "youtube",
      "monitor_id": 42,
      "latency_ms": 142.3
    }
  ]
}
```

#### `GET /api/v1/admin/metrics`
Exports telemetry summary, query statistics, and operational counters.

- **Auth**: `X-Webhook-Secret` required
- **Response `200 OK`**:
```json
{
  "counters": {
    "feed_items_discovered_total": 1250,
    "db_queries_total": 4500
  },
  "gauges": {
    "active_monitors": 48
  },
  "histograms": {
    "feed_poll_duration_seconds": {
      "count": 1250,
      "avg": 0.32,
      "p95": 0.85
    }
  },
  "uptime_seconds": 86400.0
}
```

#### `GET /metrics`
Prometheus text exposition format endpoint for scraping metrics.

---

### Monitor Management

#### `POST /api/v1/monitors/sync`
Triggers an atomic hot-reload of all monitors from PostgreSQL into memory, preserving runtime state (live status, first-run flags).

- **Auth**: `X-Webhook-Secret` required
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Monitors and settings synchronized with database"
}
```

#### `POST /api/v1/monitors/{monitor_id}/check`
Forces an immediate update check for a specific monitor instance and broadcasts new items.

- **Auth**: `X-Webhook-Secret` required
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Checked successfully"
}
```

---

### Guild Permissions

#### `GET /api/v1/guilds/{guild_id}/permissions/{user_id}`
Evaluates administrative rights, subscription tier level, and unlocked features for a Discord user in a specific guild.

- **Auth**: `X-Webhook-Secret` required
- **Response `200 OK`**:
```json
{
  "is_admin": true,
  "tier": 2,
  "tier_name": "Silver Tier",
  "features": ["basic", "custom_branding", "instant_refresh"],
  "limits": {
    "min_refresh_interval": 10,
    "max_monitors": 15,
    "max_channels": 5,
    "max_pings": 3,
    "max_purge": 50
  },
  "bot_in_guild": true
}
```

---

### Stripe Billing

#### `GET /api/v1/checkout`
Generates a Stripe Checkout Session for a guild subscription and redirects the user to the Stripe portal.

- **Query Parameters**:
  - `guild_id` (*required int*): 17–20 digit Discord Snowflake ID.
  - `tier` (*required int*): `1` (Starter), `2` (Pro), `3` (Ultimate).
  - `interval` (*optional str*, default `"mo"`): `"mo"` or `"yr"`.
- **Response**: `303 See Other` redirect to `https://checkout.stripe.com/...`

#### `POST /api/v1/stripe/webhook`
Webhook receiver for asynchronous Stripe events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`).

- **Headers**: `stripe-signature` (HMAC validation with `STRIPE_WEBHOOK_SECRET`).
- **Response `200 OK`**: `{"status": "success"}`
