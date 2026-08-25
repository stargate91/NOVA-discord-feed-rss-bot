"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, RefreshCw, Trash2, Maximize2, Minimize2 } from "lucide-react";
import devService from "@/services/devService";
import { IconButton, Button } from "@/components/ui";
import styles from "./log-streamer.module.css";

export default function LogStreamer() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetchLogs = async () => {
    try {
      const data = await devService.getLogs(100);
      if (data.logs) {
        setLogs(data.logs);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Failed to fetch logs:", err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    let interval: any;
    if (isLive) {
      interval = setInterval(fetchLogs, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (scrollRef.current && !error) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, error]);

  const clearLogs = () => {
    setLogs([]);
    setError(null);
  };

  const formatLog = (line: string) => {
    if (!line || !line.trim()) return null;

    let lineClass = "";
    if (line.includes("[ERROR]")) lineClass = styles["log-error"];
    else if (line.includes("[WARNING]")) lineClass = styles["log-warning"];
    else if (line.includes("[INFO]")) lineClass = styles["log-info"];

    return (
      <div key={line} className={[styles["log-line"], lineClass].filter(Boolean).join(" ")}>
        <span>{line}</span>
      </div>
    );
  };

  return (
    <div
      className={styles["terminal-container"]}
      style={{ height: isExpanded ? "38rem" : "20rem" }}
    >
      <div className={styles["terminal-header"]}>
        <div className={styles["header-left"]}>
          <Terminal size={14} style={{ color: "var(--accent-light)" }} />
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
            aria-label="Toggle expand"
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      <div className={styles["terminal-body"]} ref={scrollRef}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Initializing log stream...
          </p>
        ) : error ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <p style={{ color: "var(--status-error)" }}>CONNECTION ERROR: {error}</p>
            <Button variant="secondary" size="sm" onClick={fetchLogs}>
              Reconnect
            </Button>
          </div>
        ) : (
          logs.map((line, i) => <div key={i}>{formatLog(line)}</div>)
        )}
      </div>
    </div>
  );
}
