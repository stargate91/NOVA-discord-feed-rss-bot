"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Activity } from "lucide-react";
import statsService, { TickerItem } from "@/services/stats_service";
import { getPlatformLogo } from "@/utils";
import styles from "./live_ticker.module.css";

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchTicker() {
      try {
        const data = await statsService.getGlobalTicker();
        if (!ignore) {
          if (data && data.length > 0) {
            setItems(data);
          } else {
            // Fallback sample data if DB is empty
            setItems([
              { platform: 'youtube', title: 'New video from NovaFeeds Official', author_name: 'NovaFeeds' },
              { platform: 'twitch', title: 'Stream is LIVE: Dashboard Showcase', author_name: 'NovaBot' },
              { platform: 'rss', title: 'Update: Version 2.0 released', author_name: 'Changelog' }
            ]);
          }
        }
      } catch (err) {
        console.error("Ticker fetch error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchTicker();
    const interval = setInterval(fetchTicker, 30000); // Update every 30s
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) return null;

  return (
    <div className={styles["ticker-container"]}>
      <div className={styles["ticker-badge"]}>
        <Activity size={14} className={styles["ticker-pulse"]} />
        <span>LIVE FEED</span>
      </div>

      <div className={styles["ticker-track-wrapper"]}>
        <div className={styles["ticker-track"]}>
          {[...items, ...items, ...items].map((item, idx) => {
            const iconSrc = getPlatformLogo(item.platform);

            return (
              <div key={idx} className={styles["ticker-item"]}>
                <div className={styles["ticker-icon-wrap"]}>
                  <Image
                    src={iconSrc}
                    alt={item.platform}
                    width={14}
                    height={14}
                    unoptimized
                  />
                </div>
                {item.author_name && (
                  <span className={styles["ticker-author"]}>{item.author_name}:</span>
                )}
                <span className={styles["ticker-title"]}>{item.title}</span>
                <span className={styles["ticker-divider"]}>•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
