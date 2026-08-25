"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './floating-action-bar.module.css';

export interface FloatingActionBarProps {
  isVisible: boolean;
  message?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FloatingActionBar({
  isVisible,
  message,
  children,
  className,
}: FloatingActionBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
