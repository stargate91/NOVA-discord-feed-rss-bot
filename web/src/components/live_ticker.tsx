"use client";

import React from "react";
import Image from "next/image";
import { Activity } from "lucide-react";
import { useLiveTicker } from "@/hooks/use_live_ticker";
import { getPlatformLogo } from "@/utils";
import styles from "./live_ticker.module.css";

export default function LiveTicker() {
  const { items, loading } = useLiveTicker(30000);

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
