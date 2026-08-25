"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Zap, ShieldCheck, Terminal } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Badge } from '@/components/ui';
import styles from './faq.module.css';

interface FAQCategory {
  category: string;
  icon: React.ReactNode;
  questions: Array<{ q: string; a: string }>;
}

const FAQ_DATA: FAQCategory[] = [
  {
    category: "Getting Started",
    icon: <Zap size={16} />,
    questions: [
      {
        q: "How do I add a new feed monitor?",
        a: "Navigate to the 'Monitors' tab in your dashboard, click 'Add Monitor', select your platform (YouTube, RSS, Twitch, etc.), and follow the setup wizard. You'll need the URL, handle or ID of the content you want to track."
      },
      {
        q: "How do I invite the bot to my server?",
        a: "You can find the official invite link on our landing page or in the servers page. Make sure you have 'Manage Server' permissions on Discord to add it."
      }
    ]
  },
  {
    category: "Monitoring & Delivery",
    icon: <HelpCircle size={16} />,
    questions: [
      {
        q: "How often does the bot check for updates?",
        a: "Free users have a standard 20-minute check interval. Premium tiers offer ultra-fast refresh rates, down to 1-2 minutes depending on your plan."
      },
      {
        q: "Why is my monitor paused?",
        a: "Monitors can be paused manually, or automatically if the target channel is deleted or if the bot loses access to the server. You can resume them in the Monitors list."
      },
      {
        q: "Can I customize the message format?",
        a: "Yes! Professional and Architect tiers can use custom alert templates to change exactly how the message looks in Discord, including custom dynamic tags, embeds, and role pings."
      }
    ]
  },
  {
    category: "Premium & Billing",
    icon: <ShieldCheck size={16} />,
    questions: [
      {
        q: "What are the benefits of Premium?",
        a: "Premium unlocks higher monitor limits, faster refresh rates (down to 1 min), role pings, custom alert templates, custom branding, and priority support."
      },
      {
        q: "Is Premium bound to a server or a user?",
        a: "Premium is bound to a specific Discord Server. Once activated or subscribed, any administrator of that server can configure premium feeds and settings."
      }
    ]
  },
  {
    category: "Discord Commands",
    icon: <Terminal size={16} />,
    questions: [
      {
        q: "What commands can I use in Discord?",
        a: "NovaFeeds is a dashboard-first bot. All monitor management, settings, and diagnostics are done cleanly through this web panel. In Discord, type '/dashboard' to get a direct link."
      },
      {
        q: "What does the /dashboard slash command do?",
        a: "Sends an ephemeral message with a direct link to this web dashboard and the support server."
      }
    ]
  }
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={[styles['faq-item'], isOpen && styles.active].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles['faq-question']}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{q}</span>
        <ChevronDown size={16} className={styles['faq-chevron']} />
      </button>
      {isOpen && (
        <div className={styles['faq-answer']}>
          <p>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].category);
  const currentCategoryData = FAQ_DATA.find((c) => c.category === activeCategory);

  return (
    <div className={styles['faq-container']}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Frequently Asked Questions"
        description="Find answers to common questions regarding feed monitors, bot permissions, and subscriptions."
        badge={
          <Badge variant="neutral" size="sm">
            HELP DESK
          </Badge>
        }
      />

      {/* ── Categories Row ── */}
      <div className={styles['faq-categories']}>
        {FAQ_DATA.map((cat) => (
          <button
            key={cat.category}
            type="button"
            className={[
              styles['category-btn'],
              activeCategory === cat.category && styles.active,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveCategory(cat.category)}
          >
            {cat.icon}
            <span>{cat.category}</span>
          </button>
        ))}
      </div>

      {/* ── FAQ Items ── */}
      <div className={styles['faq-list']}>
        {currentCategoryData?.questions.map((item, idx) => (
          <FAQItem key={idx} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
