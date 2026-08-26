# ADR-0002: Decoupled Microservices & Worker Architecture

- **Status:** Accepted
- **Date:** 2026-08-25
- **Deciders:** Nova Core Architecture Team

---

## Context & Problem Statement

In a traditional Discord bot monolith, the Discord Gateway connection (WebSocket heartbeat), the RSS/API Polling Ingestion pipeline, and the REST Webhook API (FastAPI) all run inside a single Python process and event loop.

This introduces serious architectural bottlenecks:
1. If feed polling encounters slow network I/O or heavy parsing loads, the Discord WebSocket heartbeat can block, causing `4000/1000` disconnects and shard re-identifications.
2. The bot cannot scale horizontally: running multiple instances of a monolith causes duplicate feed polling and duplicate Discord messages.
3. API worker crashes (e.g. malformed webhook payload) risk bringing down the entire Discord Gateway client.

---

## Decision Outcome

**Chosen Solution: Three Decoupled Workers with Asynchronous Message Queues.**

The system is decomposed into three isolated microservices communicating via an abstract `BaseNotificationQueue` (with in-memory fallback and production Redis backing):

```
                        ┌─────────────────────────────────────┐
                        │   Feed Worker (Ingestion & Poller)  │
                        │       (Scales 1..N Replicas)        │
                        └──────────────────┬──────────────────┘
                                           │
                                  Pushes BroadcastPayload
                                           │
                                           ▼
                            ┌──────────────────────────────┐
                            │    Redis Notification Queue  │
                            │  (redis://host:6379/queue)   │
                            └──────────────┬───────────────┘
                                           │
                                  Pulls & Delivers
                                           │
                                           ▼
┌────────────────────────────────┐   ┌────────────────────────────────┐
│   API Worker (FastAPI Server)  │   │ Gateway Worker (Discord Shard) │
│ (Health, Dashboard, Stripe API)│   │  (WebSocket & Message Delivery)│
└────────────────────────────────┘   └────────────────────────────────┘
```

1. **Gateway Worker (`workers.gateway_worker`):** Maintains Discord WebSocket connection, commands, and consumes from the notification queue to dispatch embeds to channels.
2. **Feed Worker (`workers.feed_worker`):** Runs the `PollingScheduler` and `FeedPipeline`, parsing feeds, deduplicating in PostgreSQL, and pushing `BroadcastPayload` to the queue.
3. **API Worker (`workers.api_worker`):** Runs FastAPI REST API, Prometheus `/metrics`, and Stripe webhooks independently.

---

## Pros and Cons

### Pros
- **Fault Isolation:** A failure in an RSS feed parser or Stripe webhook never affects Discord Gateway connectivity.
- **Horizontal Scalability:** Feed workers and API workers can scale to multiple Kubernetes Pods via HPA independently of the single Discord Gateway shard.
- **Queue Flexibility:** Supports both single-process embedded dev mode (`MemoryNotificationQueue`) and enterprise cluster mode (`RedisNotificationQueue`).
