"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, Activity } from "lucide-react";
import statsService, { TickerItem } from "@/services/statsService";
import { getPlatformLogo, getPlatformColor } from "@/utils";

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const data = await statsService.getGlobalTicker();
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
      } catch (err) {
        console.error("Ticker fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTicker();
    const interval = setInterval(fetchTicker, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div className="ui-ticker-container">
      <div className="ui-ticker-badge">
        <Activity size={14} className="ui-ticker-pulse" />
        <span>LIVE FEED</span>
      </div>

      <div className="ui-ticker-track-wrapper">
        <div className="ui-ticker-track">
          {[...items, ...items, ...items].map((item, idx) => {
            const color = getPlatformColor(item.platform);
            const iconSrc = getPlatformLogo(item.platform);

            return (
              <div key={idx} className="ui-ticker-item">
                <div className="ui-ticker-icon" style={{ borderColor: color }}>
                  <Image
                    src={iconSrc}
                    alt={item.platform}
                    width={14}
                    height={14}
                    unoptimized
                  />
                </div>
                {item.author_name && (
                  <span className="ui-ticker-author">{item.author_name}:</span>
                )}
                <span className="ui-ticker-title">{item.title}</span>
                <span className="ui-ticker-divider">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
