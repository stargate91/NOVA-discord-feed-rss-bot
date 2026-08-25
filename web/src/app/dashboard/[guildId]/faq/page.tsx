"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Zap, ShieldCheck, Terminal } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Badge } from '@/components/ui';
import { FAQ_CATEGORIES } from '@/constants/faq';
import styles from './faq.module.css';

const FAQ_ICONS = {
  Zap: <Zap size={16} />,
  HelpCircle: <HelpCircle size={16} />,
  ShieldCheck: <ShieldCheck size={16} />,
  Terminal: <Terminal size={16} />,
};

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
  const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].category);
  const currentCategoryData = FAQ_CATEGORIES.find((c) => c.category === activeCategory);

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
        {FAQ_CATEGORIES.map((cat) => (
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
            {FAQ_ICONS[cat.iconName]}
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
