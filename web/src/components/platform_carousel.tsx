"use client";

import React from "react";
import Image from "next/image";
import { INFINITE_CAROUSEL_PLATFORMS } from "@/constants/platforms";
import styles from "./platform_carousel.module.css";

export default function PlatformCarousel() {
  return (
    <div className={styles["carousel-wrapper"]}>
      <div className={styles["heading-block"]}>
        <span className={styles["section-label"]}>Integrations</span>
        <h2 className={styles["section-title"]}>Supported Platforms</h2>
      </div>
      <div className={styles["carousel-track"]}>
        {INFINITE_CAROUSEL_PLATFORMS.map((platform, index) => (
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
