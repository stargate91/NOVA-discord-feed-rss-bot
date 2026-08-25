"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import {
  Heading,
  Text,
  Badge,
} from "@/components/ui";
import { PricingSection } from "@/components/pricing";
import { usePricingPlanSelection } from "@/hooks/use_pricing_plan_selection";
import styles from "./premium.module.css";

export default function PublicPremiumPage() {
  const {
    session,
    billingInterval,
    setBillingInterval,
    checkoutLoading,
    handlePurchaseClick,
    getTierPrice,
    tiers,
  } = usePricingPlanSelection();

  return (
    <PublicLayout session={session}>
      <div className={["ui-container", styles["premium-container"]].join(" ")}>
        {/* ── Header ── */}
        <header className={styles["premium-header"]}>
          <Badge variant="primary" size="md" icon={<Sparkles size={14} />}>
            UPGRADE YOUR COMMUNITY
          </Badge>

          <Heading level={1} size="5xl" weight="black">
            Choose Your <span className="text-gradient">Plan</span>
          </Heading>

          <Text as="p" size="lg" variant="secondary" className={styles["premium-lead"]}>
            Supercharge your Discord server with fast update intervals,
            unlimited feeds, custom templates, and priority delivery.
          </Text>
        </header>

        {/* ── Pricing Section (Switcher, Cards & Comparison Table) ── */}
        <PricingSection
          billingInterval={billingInterval}
          onIntervalChange={setBillingInterval}
          checkoutLoading={checkoutLoading}
          onPurchaseClick={handlePurchaseClick}
          getTierPrice={getTierPrice}
          tiers={tiers}
        />
      </div>
    </PublicLayout>
  );
}

