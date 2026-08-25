"use client";

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import styles from './floating_action_bar.module.css';

export interface FloatingActionBarProps {
  isVisible: boolean;
  message?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const emptySubscribe = () => () => {};

export function FloatingActionBar({
  isVisible,
  message,
  children,
  className,
}: FloatingActionBarProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isVisible || !mounted) return null;

  const content = (
    <div
      role="toolbar"
      aria-label="Action toolbar"
      className={[styles['action-bar'], className].filter(Boolean).join(' ')}
    >
      {message && <div className={styles.message}>{message}</div>}
      <div className={styles.actions}>{children}</div>
    </div>
  );

  return createPortal(content, document.body);
}
