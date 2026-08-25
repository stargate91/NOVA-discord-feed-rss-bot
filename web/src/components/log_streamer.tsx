"use client";

import React from "react";
import { Terminal, RefreshCw, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { IconButton, Button } from "@/components/ui";
import { useLogStream } from "@/hooks/use_log_stream";
import { getLogLevel } from "@/utils";
import styles from "./log_streamer.module.css";

const LOG_LEVEL_CLASSES = {
  error: styles["log-error"],
  warning: styles["log-warning"],
  info: styles["log-info"],
  default: "",
};

export default function LogStreamer() {
  const {
    logs,
    isLive,
    setIsLive,
    isExpanded,
    setIsExpanded,
    loading,
    error,
    scrollRef,
    fetchLogs,
    clearLogs,
  } = useLogStream(3000);


  const formatLog = (line: string) => {
    if (!line || !line.trim()) return null;

    const level = getLogLevel(line);
    const lineClass = LOG_LEVEL_CLASSES[level];

    return (
      <div key={line} className={[styles["log-line"], lineClass].filter(Boolean).join(" ")}>
        <span>{line}</span>
      </div>
    );
  };

  return (
    <div
      className={`${styles["terminal-container"]} ${isExpanded ? styles.expanded : ''}`}
    >
      <div className={styles["terminal-header"]}>
        <div className={styles["header-left"]}>
          <Terminal size={14} className={styles["terminal-icon"]} />
          <span className={styles["terminal-title"]}>System Log Streamer</span>
          {isLive && !error ? (
            <span className={[styles["status-badge"], styles["status-live"]].join(" ")}>
              ● LIVE
            </span>
          ) : (
            <span className={[styles["status-badge"], styles["status-offline"]].join(" ")}>
              OFFLINE
            </span>
          )}
        </div>

        <div className={styles["header-actions"]}>
          <IconButton
            icon={<RefreshCw size={14} className={isLive && !error ? "spin" : ""} />}
            size="xs"
            variant="ghost"
            aria-label="Toggle live streaming"
            onClick={() => setIsLive(!isLive)}
          />
          <IconButton
            icon={<Trash2 size={14} />}
            size="xs"
            variant="ghost"
            aria-label="Clear logs"
            onClick={clearLogs}
          />
          <IconButton
            icon={isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            size="xs"
            variant="ghost"
            aria-label={isExpanded ? "Minimize terminal" : "Maximize terminal"}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      <div className={styles["terminal-body"]} ref={scrollRef}>
        {error ? (
          <div className={styles["terminal-error"]}>
            <p>System log stream offline.</p>
            <span className={styles["error-reason"]}>Error: {error}</span>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchLogs}
            >
              Reconnect
            </Button>
          </div>
        ) : loading && logs.length === 0 ? (
          <div className={styles["terminal-loading"]}>
            <span className={styles["log-line"]}>
              Connecting to Nova runtime log stream...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className={styles["terminal-empty"]}>
            <span className={styles["log-line"]}>
              Log buffer empty. Waiting for events...
            </span>
          </div>
        ) : (
          logs.map((line) => formatLog(line))
        )}
      </div>
    </div>
  );
}
