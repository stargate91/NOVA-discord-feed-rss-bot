"use client";

import React from 'react';
import { useTooltip } from '@/hooks/use_tooltip';
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
  const { isVisible, triggerProps } = useTooltip({ delayMs });

  return (
    <div
      role="group"
      className={styles['tooltip-wrapper']}
      {...triggerProps}
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

