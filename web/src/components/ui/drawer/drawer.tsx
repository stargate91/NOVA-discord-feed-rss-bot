"use client";

import React, { useSyncExternalStore, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey, useBodyScrollLock } from '@/hooks';
import styles from './drawer.module.css';
import { IconButton } from '../icon_button';

export type DrawerSide = 'left' | 'right' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: DrawerSide;
  footer?: React.ReactNode;
  className?: string;
}

const emptySubscribe = () => () => {};

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  footer,
  className,
}: DrawerProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useBodyScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  if (!isOpen || !mounted) return null;

  const sideClass = styles[`side-${side}`] || styles['side-right'];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const content = (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        ref={drawerRef}
        className={[styles.drawer, sideClass, className].filter(Boolean).join(' ')}
      >
        <div className={styles['drawer-header']}>
          <div className={styles['drawer-title']}>{title}</div>
          <IconButton
            icon={<X size={18} />}
            aria-label="Close drawer"
            size="sm"
            variant="ghost"
            onClick={onClose}
          />
        </div>

        <div className={styles['drawer-content']}>{children}</div>

        {footer && <div className={styles['drawer-footer']}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
