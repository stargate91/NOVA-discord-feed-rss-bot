"use client";

import React, { Suspense } from 'react';
import { 
  Settings, 
  PlusCircle, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  Layout, 
  Crown, 
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import {
  Badge,
  Button,
  Spinner,
  Text,
} from '@/components/ui';
import styles from './guide.module.css';

function GuideContent() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '';

  const steps = [
    {
      id: 1,
      title: "Configure Server Settings",
      description: "Set your server's language, polling speed, and management roles. This ensures the bot speaks your language and staff have access.",
      icon: Settings,
      link: `/dashboard/${guildId}/settings`,
      linkText: "Configure Settings",
      tips: [
        { text: "Choose your primary language from 17 supported options", premium: false },
        { text: "Set an Admin Role so your moderation team can edit monitors", premium: false },
        { text: "Unlock fast 2-minute polling intervals with premium", premium: true }
      ]
    },
    {
      id: 2,
      title: "Create Feed Monitors",
      description: "Nova supports YouTube, Twitch, Kick, Steam, RSS, Crypto and Free Games. Just paste a link or handle and we'll handle the rest.",
      icon: PlusCircle,
      link: `/dashboard/${guildId}/monitors`,
      linkText: "Open Monitors",
      tips: [
        { text: "Add any YouTube channel, Twitch streamer, or RSS feed URL", premium: false },
        { text: "Select target Discord channels and ping roles for each feed", premium: false },
        { text: "Bulk add wizard available for batch importing monitors", premium: false }
      ]
    },
    {
      id: 3,
      title: "Design Custom Alert Embeds",
      description: "Personalize notification layouts. Customize embed colors, markdown content, and automated mention tags.",
      icon: Bell,
      link: `/dashboard/${guildId}/settings`,
      linkText: "Edit Templates",
      tips: [
        { text: "Use built-in high fidelity Cyberpunk embed templates", premium: false },
        { text: "Custom template variables: {title}, {url}, {author}", premium: true },
        { text: "Remove bot footer branding for a native server look", premium: true }
      ]
    },
    {
      id: 4,
      title: "Track Performance & Logs",
      description: "Analyze delivery throughput, peak activity hours, and system health status in real time.",
      icon: Layout,
      link: `/dashboard/${guildId}/analytics`,
      linkText: "View Analytics",
      tips: [
        { text: "Check delivery statistics in the Analytics dashboard", premium: false },
        { text: "Ensure the bot has 'Send Messages' and 'Embed Links' permissions", premium: false },
        { text: "Use diagnostics drawer in monitors for manual force checking", premium: false }
      ]
    }
  ];

  return (
    <div className={styles['guide-container']}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Quick Start Guide"
        description="Follow these 4 simple steps to set up automated high-fidelity feeds for your server."
        badge={
          <Badge variant="primary" size="sm" icon={<Sparkles size={12} />}>
            ONBOARDING
          </Badge>
        }
      />

      {/* ── Steps List ── */}
      <div className={styles['steps-list']}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className={styles['step-card']}>
              <div className={styles['step-header']}>
                <div className={styles['step-icon-box']}>
                  <Icon size={22} />
                </div>
                <div className={styles['step-title-wrap']}>
                  <span className={styles['step-num']}>Step 0{step.id}</span>
                  <h3 className={styles['step-title']}>{step.title}</h3>
                </div>
              </div>

              <Text as="p" size="sm" variant="secondary" className={styles['step-desc']}>
                {step.description}
              </Text>

              <div className={styles['tips-list']}>
                {step.tips.map((tip, idx) => (
                  <div key={idx} className={styles['tip-item']}>
                    <CheckCircle2 size={14} className={styles['tip-icon']} />
                    <span>{tip.text}</span>
                    {tip.premium && (
                      <Badge variant="warning" size="sm" icon={<Crown size={10} />}>
                        Premium
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {step.link && (
                <div style={{ marginTop: 'var(--space-xs)' }}>
                  <Link href={step.link}>
                    <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
                      {step.linkText}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading guide..." />}>
      <GuideContent />
    </Suspense>
  );
}
