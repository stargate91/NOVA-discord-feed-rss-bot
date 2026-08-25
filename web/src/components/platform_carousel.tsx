"use client";

import React from "react";
import Image from "next/image";
import styles from "./platform_carousel.module.css";

const PLATFORMS = [
  { id: "youtube", name: "YouTube", icon: "/brands/youtube.png" },
  { id: "twitch", name: "Twitch", icon: "/brands/twitch.png" },
  { id: "kick", name: "Kick", icon: "/brands/kick.png" },
  { id: "epic-games", name: "Epic Games", icon: "/brands/epic-games.png" },
  { id: "steam", name: "Steam", icon: "/brands/steam.png" },
  { id: "rss", name: "RSS", icon: "/brands/rss.png" },
  { id: "github", name: "GitHub", icon: "/brands/github.png" },
  { id: "crypto", name: "Crypto", icon: "/brands/crypto.png" },
];

export default function PlatformCarousel() {
  const displayPlatforms = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

  return (
    <div className={styles["carousel-wrapper"]}>
      <div className={styles["heading-block"]}>
        <span className={styles["section-label"]}>Integrations</span>
        <h2 className={styles["section-title"]}>Supported Platforms</h2>
      </div>
      <div className={styles["carousel-track"]}>
        {displayPlatforms.map((platform, index) => (
          <div 
            key={index} 
            className={styles["carousel-item"]}
            data-platform={platform.id}
          >
            <div className={styles["icon-box"]}>
              <Image
                src={platform.icon}
                alt={platform.name}
                width={28}
                height={28}
                unoptimized
              />
            </div>
            <span className={styles["platform-name"]}>{platform.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
