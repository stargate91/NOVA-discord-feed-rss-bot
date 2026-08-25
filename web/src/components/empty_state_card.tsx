import React from "react";
import { Rocket, Settings, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDashboardOnboardingSteps } from "@/utils/dashboard";
import styles from "./empty_state_card.module.css";

interface EmptyStateCardProps {
  guildId?: string;
}

export default function EmptyStateCard({ guildId }: EmptyStateCardProps) {
  const steps = getDashboardOnboardingSteps(guildId);

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
            {steps.map((step) => {
              const StepIcon = step.iconName === 'Settings' ? Settings : Plus;
              return (
                <Link key={step.num} href={step.href} className={styles["step-card"]}>
                  <div className={styles["step-num"]}>{step.num}</div>
                  <div className={styles["step-body"]}>
                    <h3 className={styles["step-title"]}>
                      {step.title} <StepIcon size={14} />
                    </h3>
                    <p className={styles["step-desc"]}>{step.desc}</p>
                  </div>
                  <div className={styles["arrow-wrap"]}>
                    <ArrowRight size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

