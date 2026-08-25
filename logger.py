import logging
import sys
import os
import queue
import atexit
import json
import threading
from collections import deque
from contextvars import ContextVar
from contextlib import contextmanager
from datetime import datetime, timezone
from logging.handlers import TimedRotatingFileHandler, QueueHandler, QueueListener
from colorama import init, Fore, Style

init(autoreset=True)

# ContextVar holding active structured logging context
_LOG_CONTEXT: ContextVar[dict] = ContextVar("_LOG_CONTEXT", default={})

@contextmanager
def log_context(**kwargs):
    """Context manager to attach structured metadata to all logs in the current task/coroutine."""
    current = _LOG_CONTEXT.get().copy()
    current.update({k: v for k, v in kwargs.items() if v is not None})
    token = _LOG_CONTEXT.set(current)
    try:
        yield
    finally:
        _LOG_CONTEXT.reset(token)

class ContextFilter(logging.Filter):
    """Filter that merges contextvars into LogRecord attributes."""
    def filter(self, record: logging.LogRecord) -> bool:
        ctx = _LOG_CONTEXT.get()
        for k, v in ctx.items():
            if not hasattr(record, k):
                setattr(record, k, v)
        return True

class ColoredFormatter(logging.Formatter):
    """Console formatter with ANSI color codes and contextual tags."""
    def format(self, record):
        level_colors = {
            logging.DEBUG: Fore.CYAN,
            logging.INFO: Fore.GREEN,
            logging.WARNING: Fore.YELLOW,
            logging.ERROR: Fore.RED,
            logging.CRITICAL: Fore.RED + Style.BRIGHT,
        }
        
        # Build contextual tags string
        tags = []
        if getattr(record, 'guild_id', None):
            tags.append(f"{Fore.MAGENTA}[G:{record.guild_id}]{Style.RESET_ALL}")
        if getattr(record, 'platform', None):
            tags.append(f"{Fore.BLUE}[{record.platform}]{Style.RESET_ALL}")
        if getattr(record, 'monitor_id', None):
            tags.append(f"{Fore.CYAN}[M:{record.monitor_id}]{Style.RESET_ALL}")
        if getattr(record, 'latency_ms', None) is not None:
            tags.append(f"{Fore.YELLOW}[{record.latency_ms:.1f}ms]{Style.RESET_ALL}")

        tag_str = f" {' '.join(tags)}" if tags else ""
        color = level_colors.get(record.levelno, Fore.WHITE)
        record.levelname = f"{color}{record.levelname}{Style.RESET_ALL}"
        
        if record.levelno >= logging.WARNING:
            record.msg = f"{Style.BRIGHT}{record.msg}{Style.RESET_ALL}"
            
        orig_fmt = self._fmt
        self._fmt = orig_fmt.replace("%(message)s", f"{tag_str} %(message)s")
        result = super().format(record)
        self._fmt = orig_fmt
        return result

class JSONFormatter(logging.Formatter):
    """JSON Lines formatter for structured log storage."""
    def format(self, record: logging.LogRecord) -> str:
        data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Standard known fields
        for field in ("guild_id", "monitor_id", "platform", "channel_id", "latency_ms", "event", "user_id"):
            if hasattr(record, field):
                data[field] = getattr(record, field)

        if record.exc_info:
            data["exception"] = self.formatException(record.exc_info)

        return json.dumps(data)

class RingBufferLogHandler(logging.Handler):
    """Thread-safe in-memory circular buffer for the Dev Panel log viewer."""
    def __init__(self, capacity: int = 1000):
        super().__init__()
        self.capacity = capacity
        self.buffer = deque(maxlen=capacity)
        self.lock = threading.RLock()

    def emit(self, record: logging.LogRecord):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "guild_id": getattr(record, "guild_id", None),
            "monitor_id": getattr(record, "monitor_id", None),
            "platform": getattr(record, "platform", None),
            "channel_id": getattr(record, "channel_id", None),
            "latency_ms": getattr(record, "latency_ms", None),
            "event": getattr(record, "event", None),
        }
        if record.exc_info:
            entry["exception"] = self.format(record) if self.formatter else str(record.exc_info[1])

        with self.lock:
            self.buffer.append(entry)

    def get_logs(
        self,
        limit: int = 100,
        level: str | None = None,
        guild_id: int | None = None,
        platform: str | None = None,
        search: str | None = None
    ) -> list[dict]:
        """Retrieve and filter structured logs from the in-memory ring buffer."""
        with self.lock:
            logs = list(self.buffer)

        # Reverse to get newest first
        logs.reverse()

        filtered = []
        search_lower = search.lower() if search else None
        level_upper = level.upper() if level else None

        for item in logs:
            if level_upper and item["level"] != level_upper:
                continue
            if guild_id is not None and item.get("guild_id") != guild_id:
                continue
            if platform and str(item.get("platform", "")).lower() != platform.lower():
                continue
            if search_lower and search_lower not in item["message"].lower():
                continue

            filtered.append(item)
            if len(filtered) >= limit:
                break

        return filtered

    def clear(self):
        with self.lock:
            self.buffer.clear()

# Global logger & handlers
log = logging.getLogger("FeedBot")
log.setLevel(logging.INFO)
_ring_buffer_handler = RingBufferLogHandler(capacity=1000)
_context_filter = ContextFilter()

# Attach in-memory ring buffer and context filter immediately
log.addHandler(_ring_buffer_handler)
log.addFilter(_context_filter)

_log_listener: QueueListener | None = None

def get_recent_logs(
    limit: int = 100,
    level: str | None = None,
    guild_id: int | None = None,
    platform: str | None = None,
    search: str | None = None
) -> list[dict]:
    """Public helper for Dev Panel to retrieve recent structured logs."""
    return _ring_buffer_handler.get_logs(
        limit=limit,
        level=level,
        guild_id=guild_id,
        platform=platform,
        search=search
    )

def setup_logging(level_name: str = "INFO"):
    """
    Initialize non-blocking asynchronous logging with QueueHandler and background QueueListener.
    Underlying destinations: Console, Rotating Text Log, and Structured JSON Lines Log.
    The in-memory Ring Buffer remains directly attached to the logger for immediate Dev Panel queries.
    """
    global _log_listener, _ring_buffer_handler, _context_filter
    level = getattr(logging, level_name.upper(), logging.INFO)
    log.setLevel(level)

    # Clean existing file/console handlers if re-initializing
    log.handlers = [_ring_buffer_handler]
    log.filters = [_context_filter]

    # Ensure directory exists for logging
    os.makedirs("data", exist_ok=True)

    # 1. Plain Text File Handler
    file_handler = TimedRotatingFileHandler(
        "data/feed_bot.log", 
        when="midnight", 
        interval=1, 
        backupCount=7, 
        encoding="utf-8"
    )
    file_handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))

    # 2. JSON Lines File Handler
    json_handler = TimedRotatingFileHandler(
        "data/feed_bot.jsonl",
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8"
    )
    json_handler.setFormatter(JSONFormatter())

    # 3. Colored Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(ColoredFormatter("%(asctime)s [%(levelname)s] %(message)s", "%H:%M:%S"))

    # 4. Async Queue and Background Listener Thread
    log_queue: queue.Queue = queue.Queue(-1)
    queue_handler = QueueHandler(log_queue)
    log.addHandler(queue_handler)

    if _log_listener is not None:
        _log_listener.stop()

    _log_listener = QueueListener(
        log_queue,
        file_handler,
        json_handler,
        console_handler,
        respect_handler_level=True
    )
    _log_listener.start()
    if hasattr(_log_listener, "_thread") and _log_listener._thread:
        _log_listener._thread.daemon = True

    # Register automatic cleanup on process termination
    atexit.register(stop_logging)

def stop_logging():
    """Flush pending log records and stop the background logging worker thread."""
    global _log_listener
    if _log_listener is not None:
        try:
            _log_listener.stop()
        except Exception:
            pass
        _log_listener = None
