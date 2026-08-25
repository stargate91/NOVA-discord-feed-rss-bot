"use client";

import React from "react";
import Image from "next/image";

const PLATFORMS = [
  { name: "YouTube", icon: "/brands/youtube.png", color: "#FF0000" },
  { name: "Twitch", icon: "/brands/twitch.png", color: "#9146FF" },
  { name: "Kick", icon: "/brands/kick.png", color: "#53FC18" },
  { name: "Epic Games", icon: "/brands/epic-games.png", color: "#FFFFFF" },
  { name: "Steam", icon: "/brands/steam.png", color: "#171a21" },
  { name: "RSS", icon: "/brands/rss.png", color: "#FFA500" },
  { name: "GitHub", icon: "/brands/github.png", color: "#FFFFFF" },
  { name: "Crypto", icon: "/brands/crypto.png", color: "#F7931A" },
];

export default function PlatformCarousel() {
  const displayPlatforms = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

  return (
    <div className="ui-carousel-wrapper" style={{ marginBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="ui-label-caps">Integrations</span>
        <h2 className="ui-title-section" style={{ marginBottom: 0 }}>Supported Platforms</h2>
      </div>
      <div className="ui-carousel-track">
        {displayPlatforms.map((platform, index) => (
          <div key={index} className="ui-carousel-item" style={{ '--platform-color': platform.color } as React.CSSProperties}>
            <div className="ui-carousel-icon-box">
              <Image
                src={platform.icon}
                alt={platform.name}
                width={28}
                height={28}
                unoptimized
              />
            </div>
            <span className="ui-carousel-name">{platform.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
