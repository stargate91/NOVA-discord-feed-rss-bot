"use client";

import React from "react";
import { Rocket, Settings, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./empty_state_card.module.css";

interface EmptyStateCardProps {
  guildId?: string;
}

export default function EmptyStateCard({ guildId }: EmptyStateCardProps) {
  return (
    <div className={styles["empty-state-card"]}>
      {/* Background decorative elements */}
      <div className={styles["blob-1"]} />
      <div className={styles["blob-2"]} />

      <div className={styles["card-inner"]}>
        <div className={styles["glow-icon"]}>
          <Rocket size={32} />
        </div>

        <div className={styles.content}>
          <div className={styles.badge}>First Steps</div>
          <h2 className={styles.title}>Welcome aboard!</h2>
          <p className={styles.description}>
            The server is still quiet... Let&apos;s bring it to life! Follow these two quick steps
            to get the first news delivered to your Discord channel.
          </p>

          <div className={styles["steps-container"]}>
            <Link href={`/settings?guild=${guildId || ''}`} className={styles["step-card"]}>
              <div className={styles["step-num"]}>01</div>
              <div className={styles["step-body"]}>
                <h3 className={styles["step-title"]}>
                  Settings <Settings size={14} />
                </h3>
                <p className={styles["step-desc"]}>Configure language and default colors.</p>
              </div>
              <div className={styles["arrow-wrap"]}>
                <ArrowRight size={18} />
              </div>
            </Link>

            <Link href={`/monitors?guild=${guildId || ''}`} className={styles["step-card"]}>
              <div className={styles["step-num"]}>02</div>
              <div className={styles["step-body"]}>
                <h3 className={styles["step-title"]}>
                  Add Monitor <Plus size={14} />
                </h3>
                <p className={styles["step-desc"]}>Pick a platform and start monitoring.</p>
              </div>
              <div className={styles["arrow-wrap"]}>
                <ArrowRight size={18} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
