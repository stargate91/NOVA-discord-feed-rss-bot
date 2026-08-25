"use client";

import React from 'react';
import styles from './usage_indicator.module.css';

export interface UsageIndicatorProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
}

export default function UsageIndicator({
  label,
  current,
  max,
  unit = '',
}: UsageIndicatorProps) {
  const percentage = Math.min(Math.round((current / max) * 100), 100);

  // SVG Circle parameters
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let strokeColor = 'var(--accent-light)';
  let valueColorClass = styles['color-accent'];
  if (percentage >= 100) {
    strokeColor = 'var(--status-error)';
    valueColorClass = styles['color-error'];
  } else if (percentage >= 80) {
    strokeColor = 'var(--status-warning)';
    valueColorClass = styles['color-warning'];
  }

  return (
    <div className={styles['usage-container']}>
      <div className={styles['gauge-wrapper']}>
        <svg viewBox="0 0 100 100" className={styles['gauge-svg']}>
          {/* Background Track */}
          <circle className={styles['gauge-track']} cx="50" cy="50" r={radius} />
          {/* Progress Indicator */}
          <circle
            className={styles['gauge-progress']}
            cx="50"
            cy="50"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={strokeColor}
          />
        </svg>
        <div className={styles['gauge-content']}>
          <span className={styles['gauge-value']}>{percentage}%</span>
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
            {Math.max(0, max - current)} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
