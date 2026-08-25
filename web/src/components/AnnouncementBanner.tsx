"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, X, Megaphone } from "lucide-react";
import devService, { AnnouncementItem } from "@/services/devService";
import { IconButton } from "@/components/ui";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [closedIds, setClosedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await devService.getAnnouncements();
        if (Array.isArray(data)) setAnnouncements(data);
      } catch (error) {
        // Silently catch in banner
      }
    };
    fetchAnnouncements();
  }, []);

  const closeAnnouncement = (id: number) => {
    setClosedIds((prev) => [...prev, id]);
  };

  const activeAnnouncements = announcements.filter(
    (a) => !closedIds.includes(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginBottom: "var(--space-lg)" }}>
      {activeAnnouncements.map((a) => (
        <div
          key={a.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-md)",
            padding: "var(--space-md) var(--space-lg)",
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-accent)",
            backdropFilter: "blur(var(--blur-md))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                flexShrink: 0,
              }}
            >
              {a.type === "alert" && <AlertCircle size={20} style={{ color: "var(--status-error)" }} />}
              {a.type === "warning" && <AlertTriangle size={20} style={{ color: "var(--status-warning)" }} />}
              {a.type === "info" && <Megaphone size={20} style={{ color: "var(--accent-light)" }} />}
              {a.type === "maintenance" && <AlertTriangle size={20} style={{ color: "var(--status-error)" }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3xs)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-bold)", color: "var(--text-primary)" }}>
                {a.title}
              </span>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0, lineHeight: "var(--leading-normal)" }}>
                {a.content}
              </p>
            </div>
          </div>
          <IconButton
            icon={<X size={16} />}
            size="xs"
            variant="ghost"
            aria-label="Dismiss banner"
            onClick={() => closeAnnouncement(a.id)}
          />
        </div>
      ))}
    </div>
  );
}
