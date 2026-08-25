"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Badge } from '@/components/ui';
import { useFaq } from '@/hooks/use_faq';
import { renderFaqCategoryIcon } from '@/constants/faq';
import styles from './faq.module.css';

interface FAQItemProps {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ q, a, isOpen, onToggle }: FAQItemProps) {
  return (
    <div
      className={[styles['faq-item'], isOpen && styles.active].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles['faq-question']}
        onClick={onToggle}
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
  const {
    categories,
    activeCategory,
    currentCategoryData,
    handleCategorySelect,
    toggleItem,
    isItemOpen,
  } = useFaq();

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
        {categories.map((cat) => (
          <button
            key={cat.category}
            type="button"
            className={[
              styles['category-btn'],
              activeCategory === cat.category && styles.active,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleCategorySelect(cat.category)}
          >
            {renderFaqCategoryIcon(cat.iconName, 16)}
            <span>{cat.category}</span>
          </button>
        ))}
      </div>

      {/* ── FAQ Items ── */}
      <div className={styles['faq-list']}>
        {currentCategoryData?.questions.map((item, idx) => (
          <FAQItem
            key={idx}
            q={item.q}
            a={item.a}
            isOpen={isItemOpen(idx)}
            onToggle={() => toggleItem(idx)}
          />
        ))}
      </div>
    </div>
  );
}

