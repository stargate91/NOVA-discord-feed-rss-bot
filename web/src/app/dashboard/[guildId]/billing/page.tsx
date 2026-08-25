"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PricingCard from '@/components/PricingCard';
import { TIERS } from '@/constants/tiers';
import LoginButton from '@/components/LoginButton';
import billingService from '@/services/billingService';
import settingsService from '@/services/settingsService';
import styles from '@/components/Premium.module.css';

function GuildBillingContent() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '';
  const { data: session } = useSession();

  const [billingInterval, setBillingInterval] = useState<'mo' | 'yr'>('mo');
  const [currentTier, setCurrentTier] = useState(0);
  const [isMaster, setIsMaster] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  useEffect(() => {
    if (guildId) {
      settingsService.getSettings(guildId)
        .then(data => {
          if (data.tier !== undefined) setCurrentTier(data.tier);
          if (data.isMaster !== undefined) setIsMaster(data.isMaster);
        })
        .catch(err => console.error("Failed to fetch current tier:", err));
    }

    billingService.getConfig()
      .then(data => setStripeConfig(data))
      .catch(err => console.error("Failed to fetch billing config:", err));
  }, [guildId]);

  const handlePurchaseClick = async (tier: number) => {
    if (!stripeConfig?.products) {
      alert("Billing configuration not loaded. Please refresh the page.");
      return;
    }

    const priceId = Object.keys(stripeConfig.products).find(pid => {
      const p = stripeConfig.products[pid];
      return p.tier === tier && p.interval === billingInterval;
    });

    if (!priceId) {
      alert("No Price ID found for this plan. Please contact support.");
      return;
    }

    setCheckoutLoading(tier);
    try {
      const data = await billingService.createCheckoutSession(priceId, guildId);
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      alert(err.message || "An error occurred. Please try again.");
    }
    setCheckoutLoading(null);
  };

  return (
    <div className={styles.premiumDashboardContainer}>
      <header className="ui-dashboard-header">
        <div className="ui-dashboard-info">
          <h1 className="ui-dashboard-title">Server Subscription & Plans</h1>
          <p className="ui-dashboard-subtitle">
            Manage this server's subscription tier, limits, and billing details.
          </p>
        </div>

        <div className="page-header-actions">
          <LoginButton session={session} />
        </div>
      </header>

      <div className="ui-billing-toggle-wrapper">
        <div className="ui-billing-toggle">
          <button 
            onClick={() => setBillingInterval('mo')} 
            className={billingInterval === 'mo' ? 'ui-active' : ''}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingInterval('yr')} 
            className={billingInterval === 'yr' ? 'ui-active' : ''}
          >
            Yearly <span className="ui-billing-save">SAVE 20%</span>
          </button>
        </div>
      </div>

      <div className={styles.dashboardPricingGrid}>
        {TIERS.map((t) => (
          <PricingCard
            key={t.tier}
            tier={t.tier}
            currentTier={currentTier}
            isMaster={isMaster}
            title={t.title}
            description={t.description}
            price={billingInterval === 'mo' ? t.price.mo : t.price.yr}
            interval={billingInterval === 'mo' ? 'mo' : 'yr'}
            isPopular={t.isPopular}
            features={t.features}
            onPurchaseClick={() => handlePurchaseClick(t.tier)}
            isLoading={checkoutLoading === t.tier}
          />
        ))}
      </div>
    </div>
  );
}

export default function GuildBillingPage() {
  return (
    <Suspense fallback={<div className="ui-loading-fullscreen">Loading...</div>}>
      <GuildBillingContent />
    </Suspense>
  );
}
