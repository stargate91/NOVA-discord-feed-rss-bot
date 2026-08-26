"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Megaphone } from "lucide-react";
import { useAnnouncements } from "@/hooks/use_announcements";
import { Alert, AlertVariant } from "@/components/ui";
import styles from "./announcement_banner.module.css";

const VARIANT_MAP: Record<string, AlertVariant> = {
  alert: "error",
  warning: "warning",
  info: "info",
  maintenance: "error",
};

const ICON_MAP: Record<string, React.ReactNode> = {
  alert: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Megaphone size={20} />,
  maintenance: <AlertTriangle size={20} />,
};

export default function AnnouncementBanner() {
  const { activeAnnouncements, closeAnnouncement } = useAnnouncements();

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className={styles["banner-container"]}>
      {activeAnnouncements.map((a) => (
        <Alert
          key={a.id}
          variant={VARIANT_MAP[a.type] || "info"}
          icon={ICON_MAP[a.type]}
          title={a.title}
          onClose={() => closeAnnouncement(a.id)}
        >
          {a.content}
        </Alert>
      ))}
    </div>
  );
}
