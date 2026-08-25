"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import {
  Heading,
  Text,
  Badge,
  Grid,
  SegmentedControl,
  Stack,
} from "@/components/ui";
import { PricingCard, PremiumComparisonTable } from "@/components/pricing";
import { TIERS } from "@/constants/tiers";
import styles from "./premium.module.css";

export default function PublicPremiumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<"mo" | "yr">("mo");

  const handlePurchaseClick = (_tier: number) => {
    if (!session) {
      signIn("discord", { callbackUrl: "/servers" });
      return;
    }
    router.push("/servers");
  };

  return (
    <PublicLayout session={session}>
      <div className={["ui-container", styles["premium-container"]].join(" ")}>
        {/* ── Header ── */}
        <header className={styles["premium-header"]}>
          <Badge variant="primary" size="md" icon={<Sparkles size={14} />}>
            UPGRADE YOUR COMMUNITY
          </Badge>

          <Heading level={1} size="5xl" weight="black">
            Choose Your <span className={styles["text-gradient"]}>Plan</span>
          </Heading>

          <Text as="p" size="lg" variant="secondary" className={styles["premium-lead"]}>
            Supercharge your Discord server with fast update intervals,
            unlimited feeds, custom templates, and priority delivery.
          </Text>

          {/* Billing Switcher */}
          <div className={styles["switcher-wrapper"]}>
            <SegmentedControl<"mo" | "yr">
              value={billingInterval}
              onChange={setBillingInterval}
              options={[
                { value: "mo", label: "Monthly Billing" },
                {
                  value: "yr",
                  label: (
                    <span className={styles["yearly-label"]}>
                      <span>Yearly Billing</span>
                      <Badge variant="warning" size="sm">
                        SAVE 20%
                      </Badge>
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </header>

        {/* ── Pricing Cards Grid ── */}
        <Grid columns={4} gap="lg">
          {TIERS.map((t) => (
            <PricingCard
              key={t.tier}
              tier={t.tier}
              title={t.title}
              description={t.description}
              price={billingInterval === "mo" ? t.price.mo : t.price.yr}
              interval={billingInterval === "mo" ? "mo" : "yr"}
              isPopular={t.isPopular}
              features={t.features}
              onPurchaseClick={() => handlePurchaseClick(t.tier)}
            />
          ))}
        </Grid>

        {/* ── Feature Comparison Table ── */}
        <Stack gap="md" align="center" className={styles["comparison-section"]}>
          <Heading level={2} size="3xl" weight="bold">
            Compare Plan Features
          </Heading>
          <Text as="p" size="sm" variant="muted">
            Everything you need to know about limits and exclusive perks.
          </Text>
          <PremiumComparisonTable />
        </Stack>
      </div>
    </PublicLayout>
  );
}
