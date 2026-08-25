"use client";

import React, { useState } from 'react';
import styles from './tooltip.module.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  delayMs?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delayMs = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const show = () => {
    const id = setTimeout(() => setIsVisible(true), delayMs);
    setTimeoutId(id);
  };

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div
      role="group"
      className={styles['tooltip-wrapper']}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={[
            styles.tooltip,
            styles[position],
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {content}
        </div>
      )}
    </div>
  );
}
