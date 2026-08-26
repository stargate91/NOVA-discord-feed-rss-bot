# Nova System Architecture & Design

This document details the high-level architecture, module interactions, and core data flows within the Nova Discord Feed Bot platform.

---

## 1. High-Level Component Architecture

Nova is organized as a decoupled, multi-layered system designed to support both single-process monolith execution and horizontally scalable distributed worker clusters.

```mermaid
flowchart TB
    subgraph Clients ["Clients & External Callers"]
        WebDashboard["Web Management Dashboard (Next.js)"]
        StripeGateway["Stripe Webhooks & Checkout"]
        PrometheusScraper["Prometheus Metrics Scraper"]
    end

    subgraph APILayer ["FastAPI Web & Management Server (:8080)"]
        RouterAdmin["/api/v1/admin/* (Logs, Metrics)"]
        RouterMonitors["/api/v1/monitors/* (Sync, Check, Repost)"]
        RouterGuilds["/api/v1/guilds/* (Permissions, Tiers)"]
        RouterStripe["/api/v1/stripe/* (Webhook, Checkout)"]
        HealthEndpoint["/health & /api/v1/health (DB Latency Probe)"]
        AuthRateLimit["Auth (HMAC) & Sliding-Window RateLimiter"]
    end

    subgraph CoreBot ["Discord Gateway Service (discord.py)"]
        FeedBot["FeedBot Client"]
        BoundedCache["BoundedGuildSettingsCache (LRU 5000)"]
        Entitlements["EntitlementService (Tiers & Features)"]
        Permissions["PermissionService"]
        DeadChannelFilter["DeadChannelBlacklist (TTL & Sweep)"]
    end

    subgraph IngestionEngine ["Ingestion Engine & Scheduler"]
        MonitorFactory["MonitorFactory (Dynamic Registry)"]
        Monitors["Active Monitors (YouTube, Twitch, RSS, etc.)"]
        Scheduler["PollingScheduler (Semaphore Concurrency = 15)"]
        Pipeline["FeedPipeline (Deduplication & Layouts)"]
        SharedCache["SharedDataCache (Per-item TTL & GC)"]
    end

    subgraph Storage ["Persistence & Distributed Queue"]
        PostgresDB[("PostgreSQL Database (asyncpg / SQLAlchemy)")]
        RedisQueue[("Redis Queue (Optional Distributed Mode)")]
    end

    WebDashboard --> AuthRateLimit --> RouterAdmin & RouterMonitors & RouterGuilds
    StripeGateway --> RouterStripe
    PrometheusScraper --> RouterAdmin

    RouterMonitors --> FeedBot
    RouterGuilds --> Entitlements
    RouterStripe --> PostgresDB

    FeedBot --> BoundedCache
    FeedBot --> DeadChannelFilter

    Scheduler --> Monitors --> Pipeline --> FeedBot
    Monitors -.-> MonitorFactory
    Pipeline --> PostgresDB
    Pipeline --> SharedCache
    Pipeline -.-> RedisQueue
```

---

## 2. Ingestion & Polling Pipeline Flow

```mermaid
sequenceDiagram
    autonumber
    participant S as PollingScheduler
    participant M as BaseMonitor (e.g. YouTubeMonitor)
    participant C as SharedDataCache
    participant P as FeedPipeline
    participant DB as PostgreSQL (monitor_repo)
    participant D as DiscordDeliveryAdapter
    participant G as Discord Gateway / Channel

    S->>M: Check if interval elapsed (Semaphore limit: 15)
    activate M
    M->>C: Check shared cache for fresh payload
    alt Cache Hit
        C-->>M: Return cached feed data
    else Cache Miss
        M->>M: Fetch from Provider API / RSS Feed
        M->>C: Store in shared cache with TTL
    end
    M->>DB: Query published_entries for deduplication
    DB-->>M: Set of already published IDs
    M->>P: Dispatch newly discovered items
    deactivate M

    activate P
    P->>P: Generate Embed & Layout (Custom Branding / Locale)
    P->>D: BroadcastPayload (Embed, Components, Channels)
    deactivate P

    activate D
    D->>D: Check DeadChannelBlacklist
    alt Channel is Dead
        D-->>P: Skip delivery (Circuit Broken)
    else Channel is Active
        D->>G: Send Discord Embed & Components
        alt HTTP 404 / 403 Channel Deleted
            G-->>D: Channel Inaccessible Error
            D->>D: mark_channel_dead(channel_id, TTL=3600)
        else Delivery Successful
            G-->>D: HTTP 200 OK
            D->>DB: mark_as_published_bulk(entry_ids)
        end
    end
    deactivate D
```

---

## 3. Stripe Subscription & Entitlement Lifecycle

```mermaid
stateDiagram-v2
    [*] --> FreeTier: Bot joins Guild (Tier 0)
    FreeTier --> CheckoutInitiated: Admin clicks /checkout?tier=2
    CheckoutInitiated --> StripePortal: Redirect to Stripe Checkout

    state StripePortal {
        [*] --> ProcessingPayment
        ProcessingPayment --> CheckoutCompleted: Success
        ProcessingPayment --> Canceled: User Aborts
    }

    Canceled --> FreeTier: Returns to dashboard
    CheckoutCompleted --> WebhookReceived: checkout.session.completed

    state WebhookReceived {
        [*] --> VerifySignature: HMAC Webhook Secret
        VerifySignature --> UpdateDB: update_guild_settings(tier=2, premium_until=now+32d)
        UpdateDB --> CacheInvalidate: Invalidate local GuildSettingsCache
    }

    WebhookReceived --> ActiveSubscription: Tier 2 Active (Bronze/Silver/Gold)

    ActiveSubscription --> SubscriptionRenewed: customer.subscription.updated
    SubscriptionRenewed --> ActiveSubscription: Extends premium_until

    ActiveSubscription --> SubscriptionCancelled: customer.subscription.deleted
    SubscriptionCancelled --> GracePeriod: 2 Days Grace Period
    GracePeriod --> FreeTier: Revert to Tier 0 after expiry
```

---

## 4. Dead-Channel Circuit Breaker Pattern

To prevent rate-limit starvation and excessive Discord API errors when servers delete channels without removing the bot's feeds, the delivery system utilizes an in-memory circuit breaker:

```mermaid
flowchart LR
    Start([Send Notification]) --> CheckBlacklist{In Dead Channels?}
    CheckBlacklist -- Yes (Within 1h TTL) --> Skip[Skip Delivery & Log Warning]
    CheckBlacklist -- No --> TryDeliver[Dispatch Discord API Request]

    TryDeliver --> Result{Delivery Result?}
    Result -- Success (200) --> Done([Mark Published])
    Result -- 404 NotFound / 403 Forbidden --> MarkDead[Mark Channel Dead: TTL=3600s]
    MarkDead --> EvictLRU{Capacity > 5000?}
    EvictLRU -- Yes --> Sweep[Sweep Expired / LRU 10%] --> DoneFail([Fail Safe])
    EvictLRU -- No --> DoneFail
```
