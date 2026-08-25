"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import PricingCard from '@/components/PricingCard';
import { Sparkles } from 'lucide-react';
import MarketingNavbar from '@/components/MarketingNavbar';
import Footer from '@/components/Footer';
import { TIERS } from '@/constants/tiers';
import styles from '@/components/Premium.module.css';

export default function PublicPremiumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<'mo' | 'yr'>('mo');

  const handlePurchaseClick = (_tier: number) => {
    if (!session) {
      signIn('discord', { callbackUrl: '/servers' });
      return;
    }
    router.push('/servers');
  };

  return (
    <div className={`${styles.premiumLandingRoot} ui-full-width-content`}>
      <MarketingNavbar session={session} />

      <div className={styles.landingContainer} style={{ paddingTop: '8rem', paddingBottom: '5rem' }}>
        <header className={styles.marketingHeader}>
          <div className="ui-badge-neon">
            <Sparkles size={16} />
            <span>UPGRADE YOUR COMMUNITY</span>
          </div>
          <h1 className="ui-title-hero" style={{ fontSize: '3.5rem', marginTop: '1.5rem' }}>
            Choose Your <span className="ui-text-gradient">Plan</span>
          </h1>
          <p className="ui-text-lead">
            Supercharge your Discord server with fast update intervals, unlimited feeds, custom templates, and priority delivery.
          </p>

          <div className={styles.billingSwitcherWrapper}>
            <div className={styles.dashboardBillingToggle}>
              <button onClick={() => setBillingInterval('mo')} className={billingInterval === 'mo' ? styles.active : ''}>Monthly</button>
              <button onClick={() => setBillingInterval('yr')} className={billingInterval === 'yr' ? styles.active : ''}>
                Yearly <span className={styles.saveBadge}>SAVE 20%</span>
              </button>
            </div>
          </div>
        </header>

        <div className={styles.pricingGrid}>
          {TIERS.map((t) => (
            <PricingCard
              key={t.tier}
              tier={t.tier}
              title={t.title}
              description={t.description}
              price={billingInterval === 'mo' ? t.price.mo : t.price.yr}
              interval={billingInterval === 'mo' ? 'mo' : 'yr'}
              isPopular={t.isPopular}
              features={t.features}
              onPurchaseClick={() => handlePurchaseClick(t.tier)}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
