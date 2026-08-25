"use client";

import React from 'react';
import { calculateGaugeMetrics } from '@/utils';
import styles from './usage_indicator.module.css';

export interface UsageIndicatorProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
}

const GAUGE_RADIUS = 36;

const VARIANT_CLASS_MAP = {
  accent: styles['color-accent'],
  warning: styles['color-warning'],
  error: styles['color-error'],
};

export default function UsageIndicator({
  label,
  current,
  max,
  unit = '',
}: UsageIndicatorProps) {
  const metrics = calculateGaugeMetrics(current, max, GAUGE_RADIUS);
  const valueColorClass = VARIANT_CLASS_MAP[metrics.variant];

  return (
    <div className={styles['usage-container']}>
      <div className={styles['gauge-wrapper']}>
        <svg viewBox="0 0 100 100" className={styles['gauge-svg']}>
          {/* Background Track */}
          <circle className={styles['gauge-track']} cx="50" cy="50" r={GAUGE_RADIUS} />
          {/* Progress Indicator */}
          <circle
            className={styles['gauge-progress']}
            cx="50"
            cy="50"
            r={GAUGE_RADIUS}
            strokeDasharray={metrics.circumference}
            strokeDashoffset={metrics.offset}
            stroke={metrics.strokeColor}
          />
        </svg>
        <div className={styles['gauge-content']}>
          <span className={styles['gauge-value']}>{metrics.percentage}%</span>
          <span className={styles['gauge-label']}>{label}</span>
        </div>
      </div>

      <div className={styles['stats-grid']}>
        <div className={styles['stat-pill']}>
          <span className={styles['stat-pill-label']}>Usage</span>
          <span className={`${styles['stat-pill-value']} ${valueColorClass}`}>
            {current} / {max} {unit}
          </span>
        </div>
        <div className={styles['stat-pill']}>
          <span className={styles['stat-pill-label']}>Remaining</span>
          <span className={styles['stat-pill-value']}>
            {metrics.remaining} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
