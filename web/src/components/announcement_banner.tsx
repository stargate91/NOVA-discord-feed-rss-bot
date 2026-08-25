"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, X, Megaphone } from "lucide-react";
import devService, { AnnouncementItem } from "@/services/dev_service";
import { IconButton } from "@/components/ui";
import styles from "./announcement_banner.module.css";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [closedIds, setClosedIds] = useState<number[]>([]);

  useEffect(() => {
    let ignore = false;
    const fetchAnnouncements = async () => {
      try {
        const data = await devService.getAnnouncements();
        if (!ignore && Array.isArray(data)) setAnnouncements(data);
      } catch (error) {
        // Silently catch in banner
      }
    };
    fetchAnnouncements();
    return () => {
      ignore = true;
    };
  }, []);

  const closeAnnouncement = (id: number) => {
    setClosedIds((prev) => [...prev, id]);
  };

  const activeAnnouncements = announcements.filter(
    (a) => !closedIds.includes(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className={styles["banner-container"]}>
      {activeAnnouncements.map((a) => (
        <div key={a.id} className={styles["banner-card"]}>
          <div className={styles["banner-left"]}>
            <div className={styles["banner-icon-box"]}>
              {a.type === "alert" && <AlertCircle size={20} className={styles["icon-error"]} />}
              {a.type === "warning" && <AlertTriangle size={20} className={styles["icon-warning"]} />}
              {a.type === "info" && <Megaphone size={20} className={styles["icon-info"]} />}
              {a.type === "maintenance" && <AlertTriangle size={20} className={styles["icon-error"]} />}
            </div>
            <div className={styles["banner-text-wrap"]}>
              <span className={styles["banner-title"]}>
                {a.title}
              </span>
              <p className={styles["banner-content"]}>
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
