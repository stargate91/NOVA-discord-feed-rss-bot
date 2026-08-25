import time
import threading
from contextlib import contextmanager
from typing import Optional

class MetricsService:
    """
    In-memory, high-performance telemetry and metrics service.
    Outputs both Prometheus exposition format (/metrics) and JSON summaries for Dev Panel dashboards.
    """

    def __init__(self):
        self._lock = threading.RLock()
        self._counters: dict[str, dict[tuple, float]] = {}
        self._gauges: dict[str, dict[tuple, float]] = {}
        self._timings: dict[str, dict[tuple, list[float]]] = {}
        self._start_time = time.time()

    def _format_labels(self, labels: dict | None) -> tuple:
        if not labels:
            return ()
        return tuple(sorted((str(k), str(v)) for k, v in labels.items()))

    def increment(self, name: str, value: float = 1.0, labels: dict | None = None):
        """Increment a metric counter."""
        key = self._format_labels(labels)
        with self._lock:
            if name not in self._counters:
                self._counters[name] = {}
            self._counters[name][key] = self._counters[name].get(key, 0.0) + value

    def set_gauge(self, name: str, value: float, labels: dict | None = None):
        """Set a metric gauge to a specific value."""
        key = self._format_labels(labels)
        with self._lock:
            if name not in self._gauges:
                self._gauges[name] = {}
            self._gauges[name][key] = float(value)

    def observe_duration(self, name: str, duration_seconds: float, labels: dict | None = None):
        """Record an execution duration timing (in seconds)."""
        key = self._format_labels(labels)
        with self._lock:
            if name not in self._timings:
                self._timings[name] = {}
            if key not in self._timings[name]:
                self._timings[name][key] = []
            # Keep last 500 measurements per label set to prevent memory growth
            timings_list = self._timings[name][key]
            timings_list.append(duration_seconds)
            if len(timings_list) > 500:
                timings_list.pop(0)

    @contextmanager
    def measure(self, name: str, labels: dict | None = None):
        """Context manager to measure and record block execution duration."""
        start = time.perf_counter()
        try:
            yield
        finally:
            duration = time.perf_counter() - start
            self.observe_duration(name, duration, labels)

    # Domain helper recording methods
    def record_feed_item_discovered(self, platform: str, count: int = 1):
        self.increment("feed_items_discovered_total", value=count, labels={"platform": platform})

    def record_notification_delivered(self, platform: str, success: bool, duration_seconds: float = 0.0):
        status = "success" if success else "failure"
        self.increment("notifications_delivered_total", labels={"platform": platform, "status": status})
        if duration_seconds > 0:
            self.observe_duration("notification_delivery_duration_seconds", duration_seconds, labels={"platform": platform})

    def record_rate_limit(self, platform: str):
        self.increment("rate_limits_encountered_total", labels={"platform": platform})

    def record_http_request(self, endpoint: str, status_code: int, duration_seconds: float = 0.0):
        self.increment("http_requests_total", labels={"endpoint": endpoint, "status": str(status_code)})
        if duration_seconds > 0:
            self.observe_duration("http_request_duration_seconds", duration_seconds, labels={"endpoint": endpoint})

    def export_summary(self) -> dict:
        """Export high-level telemetry summary dictionary for Dev Panel dashboard widgets."""
        with self._lock:
            uptime_seconds = time.time() - self._start_time
            
            # Aggregate counters
            counters_summary = {}
            for name, series in self._counters.items():
                total = sum(series.values())
                by_labels = {
                    ",".join(f"{k}={v}" for k, v in label_tuple): val
                    for label_tuple, val in series.items()
                }
                counters_summary[name] = {"total": total, "series": by_labels}

            # Aggregate gauges
            gauges_summary = {}
            for name, series in self._gauges.items():
                gauges_summary[name] = {
                    ",".join(f"{k}={v}" for k, v in label_tuple): val
                    for label_tuple, val in series.items()
                }

            # Aggregate latencies
            latencies_summary = {}
            for name, series in self._timings.items():
                latencies_summary[name] = {}
                for label_tuple, measurements in series.items():
                    label_key = ",".join(f"{k}={v}" for k, v in label_tuple) if label_tuple else "all"
                    if measurements:
                        avg_ms = (sum(measurements) / len(measurements)) * 1000.0
                        p95_sorted = sorted(measurements)
                        p95_idx = int(len(p95_sorted) * 0.95)
                        p95_ms = p95_sorted[min(p95_idx, len(p95_sorted) - 1)] * 1000.0
                        latencies_summary[name][label_key] = {
                            "count": len(measurements),
                            "avg_ms": round(avg_ms, 2),
                            "p95_ms": round(p95_ms, 2)
                        }

        return {
            "uptime_seconds": round(uptime_seconds, 1),
            "counters": counters_summary,
            "gauges": gauges_summary,
            "latencies": latencies_summary
        }

    def export_prometheus(self) -> str:
        """Export all registered metrics in standard Prometheus text exposition format."""
        lines = []
        with self._lock:
            # Uptime
            lines.append("# HELP process_uptime_seconds Process uptime in seconds.")
            lines.append("# TYPE process_uptime_seconds gauge")
            lines.append(f"process_uptime_seconds {time.time() - self._start_time:.2f}")

            # Counters
            for name, series in self._counters.items():
                lines.append(f"# HELP {name} Total count of {name}")
                lines.append(f"# TYPE {name} counter")
                for label_tuple, val in series.items():
                    if label_tuple:
                        label_str = ",".join(f'{k}="{v}"' for k, v in label_tuple)
                        lines.append(f"{name}{{{label_str}}} {val}")
                    else:
                        lines.append(f"{name} {val}")

            # Gauges
            for name, series in self._gauges.items():
                lines.append(f"# HELP {name} Current value of {name}")
                lines.append(f"# TYPE {name} gauge")
                for label_tuple, val in series.items():
                    if label_tuple:
                        label_str = ",".join(f'{k}="{v}"' for k, v in label_tuple)
                        lines.append(f"{name}{{{label_str}}} {val}")
                    else:
                        lines.append(f"{name} {val}")

            # Timings (as summary count and sum)
            for name, series in self._timings.items():
                lines.append(f"# HELP {name} Summary of {name}")
                lines.append(f"# TYPE {name} summary")
                for label_tuple, measurements in series.items():
                    if measurements:
                        count = len(measurements)
                        total_sum = sum(measurements)
                        if label_tuple:
                            label_str = ",".join(f'{k}="{v}"' for k, v in label_tuple)
                            lines.append(f"{name}_count{{{label_str}}} {count}")
                            lines.append(f"{name}_sum{{{label_str}}} {total_sum:.4f}")
                        else:
                            lines.append(f"{name}_count {count}")
                            lines.append(f"{name}_sum {total_sum:.4f}")

        return "\n".join(lines) + "\n"

# Singleton metrics instance
metrics = MetricsService()
