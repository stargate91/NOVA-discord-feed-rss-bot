"use client";

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import styles from './pricing_card.module.css';
import { Button, Divider } from '@/components/ui';
import { TierFeature } from '@/constants/tiers';
import { calculatePricingCardState } from '@/utils/pricing_helpers';

export interface PricingCardProps {
  title: string;
  price: string;
  interval?: 'mo' | 'yr' | string;
  features?: TierFeature[];
  isPopular?: boolean;
  tier?: number;
  currentTier?: number;
  isMaster?: boolean;
  description?: string;
  onPurchaseClick?: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  title,
  price,
  interval = 'mo',
  features = [],
  isPopular = false,
  tier = 0,
  currentTier = 0,
  isMaster = false,
  description = '',
  onPurchaseClick = () => {},
  isLoading = false,
}: PricingCardProps) {
  const {
    isFree,
    isDisabled,
    canPurchase,
    buttonLabel,
    buttonVariant,
  } = calculatePricingCardState({
    tier,
    currentTier,
    isMaster,
    isLoading,
    isPopular,
  });

  return (
    <div
      className={[
        styles['pricing-card'],
        isPopular && styles.popular,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isPopular && (
        <span className={styles['popular-badge']}>Most Popular</span>
      )}

      <div className={styles['pricing-header']}>
        <h3 className={styles['pricing-title']}>{title}</h3>
        <p className={styles['pricing-desc']}>{description}</p>
      </div>

      <div className={styles['pricing-price-wrapper']}>
        {!isFree && <span className={styles['price-currency']}>€</span>}
        <span className={styles['price-amount']}>{price}</span>
        {!isFree && (
          <span className={styles['price-interval']}>/{interval}</span>
        )}
      </div>

      <Divider variant="subtle" />

      <ul className={styles['feature-list']}>
        {features.map((feature, idx) => (
          <li
            key={idx}
            className={[
              styles['feature-item'],
              feature.highlight && styles.highlight,
              feature.disabled && styles.disabled,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Check size={16} className={styles['feature-icon']} />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>

      <div className={styles['pricing-action']}>
        <Button
          variant={buttonVariant}
          size="lg"
          fullWidth
          disabled={isDisabled}
          isLoading={isLoading}
          rightIcon={
            canPurchase ? (
              <ChevronRight size={18} />
            ) : undefined
          }
          onClick={() => {
            if (canPurchase) {
              onPurchaseClick();
            }
          }}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

