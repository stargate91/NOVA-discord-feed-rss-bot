import logging
import sys
import os
import queue
import atexit
from logging.handlers import TimedRotatingFileHandler, QueueHandler, QueueListener
from colorama import init, Fore, Style

init(autoreset=True)

class ColoredFormatter(logging.Formatter):
    def format(self, record):
        level_colors = {
            logging.DEBUG: Fore.CYAN,
            logging.INFO: Fore.GREEN,
            logging.WARNING: Fore.YELLOW,
            logging.ERROR: Fore.RED,
            logging.CRITICAL: Fore.RED + Style.BRIGHT,
        }
        
        # Add guild context if available
        guild_info = ""
        if hasattr(record, 'guild_id') and record.guild_id:
            guild_info = f" {Fore.MAGENTA}[G:{record.guild_id}]{Style.RESET_ALL}"
            
        color = level_colors.get(record.levelno, Fore.WHITE)
        record.levelname = f"{color}{record.levelname}{Style.RESET_ALL}"
        
        # Highlight warnings and errors
        if record.levelno >= logging.WARNING:
            record.msg = f"{Style.BRIGHT}{record.msg}{Style.RESET_ALL}"
            
        orig_fmt = self._fmt
        self._fmt = orig_fmt.replace("%(message)s", f"{guild_info} %(message)s")
        result = super().format(record)
        self._fmt = orig_fmt
        return result

log = logging.getLogger("FeedBot")
_log_listener: QueueListener | None = None

def setup_logging(level_name: str = "INFO"):
    """
    Initialize non-blocking asynchronous logging with QueueHandler and background QueueListener.
    All disk and console I/O runs in a dedicated thread without blocking the async event loop.
    """
    global _log_listener
    level = getattr(logging, level_name.upper(), logging.INFO)
    log.setLevel(level)

    # Clean existing handlers if re-initializing
    log.handlers.clear()

    # Ensure directory exists for logging
    os.makedirs("data", exist_ok=True)

    # 1. Underlying disk and console handlers
    file_handler = TimedRotatingFileHandler(
        "data/feed_bot.log", 
        when="midnight", 
        interval=1, 
        backupCount=7, 
        encoding="utf-8"
    )
    file_handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(ColoredFormatter("%(asctime)s [%(levelname)s] %(message)s", "%H:%M:%S"))

    # 2. Async Queue and Background Listener Thread
    log_queue: queue.Queue = queue.Queue(-1)
    queue_handler = QueueHandler(log_queue)
    log.addHandler(queue_handler)

    if _log_listener is not None:
        _log_listener.stop()

    _log_listener = QueueListener(log_queue, file_handler, console_handler, respect_handler_level=True)
    _log_listener.start()

    # Register automatic cleanup on process termination
    atexit.register(stop_logging)

def stop_logging():
    """Flush pending log records and stop the background logging worker thread."""
    global _log_listener
    if _log_listener is not None:
        _log_listener.stop()
        _log_listener = None
