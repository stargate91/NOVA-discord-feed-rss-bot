"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronDown, HelpCircle, MessageSquare, Zap, ShieldCheck, Terminal } from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import styles from './faq.module.css';

interface FAQCategory {
  category: string;
  icon: React.ReactNode;
  questions: Array<{ q: string; a: string }>;
}

const FAQ_DATA: FAQCategory[] = [
  {
    category: "Getting Started",
    icon: <Zap size={20} />,
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
    icon: <HelpCircle size={20} />,
    questions: [
      {
        q: "How often does the bot check for updates?",
        a: "Free users have a standard check interval. Premium tiers offer ultra-fast refresh rates, down to 1-2 minutes depending on your plan."
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
    icon: <ShieldCheck size={20} />,
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
    icon: <Terminal size={20} />,
    questions: [
      {
        q: "What commands can I use in Discord?",
        a: "NovaFeeds is a dashboard-first bot. All monitor management, settings, and diagnostics are done cleanly through this web panel. In Discord, type '/dashboard' to get a direct link."
      },
      {
        q: "/dashboard",
        a: "Sends an ephemeral message with a direct link to this web dashboard and the support server."
      }
    ]
  }
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.faqItemActive : ''}`} onClick={() => setIsOpen(!isOpen)}>
      <div className={styles.faqQuestion}>
        <span>{q}</span>
        <div className={styles.faqChevronWrapper}>
          <ChevronDown size={18} className={styles.faqChevron} />
        </div>
      </div>
      <div className={styles.faqAnswer}>
        <div className={styles.faqAnswerInner}>
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].category);

  return (
    <div className={styles.faqPage}>
      <div className={styles.glowTopRight}></div>
      <div className={styles.glowBottomLeft}></div>

      <header className="ui-dashboard-header">
        <div className="ui-dashboard-info">
          <h1 className="ui-dashboard-title">Frequently Asked Questions</h1>
          <p className="ui-dashboard-subtitle">
            Everything you need to know about NovaFeeds. Can&apos;t find what you&apos;re looking for? 
            Our support team is always ready to help.
          </p>
        </div>
        <div className="page-header-actions">
          <LoginButton session={session} />
        </div>
      </header>

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        {FAQ_DATA.map((section) => (
          <button 
            key={section.category}
            className={`${styles.categoryTab} ${activeCategory === section.category ? styles.categoryTabActive : ''}`}
            onClick={() => setActiveCategory(section.category)}
          >
            {section.icon}
            <span>{section.category}</span>
            {activeCategory === section.category && <div className={styles.tabIndicator}></div>}
          </button>
        ))}
      </div>

      <div className={styles.faqContent}>
        {FAQ_DATA.filter(s => s.category === activeCategory).map((section) => (
          <div key={section.category} className={styles.faqSectionWrapper}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <div className={styles.iconPulse}></div>
              </div>
              <div className={styles.sectionTitleGroup}>
                <h3 className="ui-monitor-name" style={{ fontSize: '1.5rem' }}>{section.category}</h3>
                <div className={styles.sectionLine}></div>
              </div>
            </div>
            <div className={styles.questionsGrid}>
              {section.questions.map((item, i) => (
                <div key={i} className={styles.animatedItem} style={{ "--delay": `${i * 0.1}s` } as React.CSSProperties}>
                  <FAQItem q={item.q} a={item.a} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support CTA Section */}
      <section className={styles.supportCta}>
        <div className="ui-card">
          <div className="ui-card-glow"></div>
          <div className={styles.ctaContent}>
            <div className={styles.ctaIconWrapper}>
              <MessageSquare size={32} color="var(--accent-color)" />
            </div>
            <div className={styles.ctaText}>
              <h3 className="ui-monitor-name" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Still have questions?</h3>
              <p className="ui-dashboard-subtitle">Our dedicated support team and community are ready to help you 24/7. Join our Discord to get instant assistance.</p>
            </div>
            <a href="https://discord.gg/PbvX3S7pXR" target="_blank" rel="noopener noreferrer" className={styles.ctaButtonWrapper} style={{ textDecoration: 'none' }}>
              <button className="ui-btn-primary" style={{ padding: '0.8rem 2rem' }}>
                <MessageSquare size={20} />
                <span>Join Support Server</span>
              </button>
            </a>
          </div>
          <div className={styles.ctaFooter}>
            <div className={styles.onlineBadge}>
              <div className={styles.onlineDot}></div>
              <span>Support Team Online</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
