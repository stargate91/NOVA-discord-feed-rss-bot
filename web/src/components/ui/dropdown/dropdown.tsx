"use client";

import React, { useState, useRef } from 'react';
import { useClickOutside, useEscapeKey } from '@/hooks';
import styles from './dropdown.module.css';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = 'right',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);

  return (
    <div ref={dropdownRef} className={[styles['dropdown-root'], className].filter(Boolean).join(' ')}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(prev => !prev);
          }
        }}
        role="button" 
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={[
            styles['dropdown-menu'],
            align === 'left' && styles['align-left'],
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          tabIndex={-1}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  danger?: boolean;
}

export function DropdownItem({
  icon,
  danger = false,
  children,
  className,
  ...props
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[
        styles['dropdown-item'],
        danger && styles.danger,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function DropdownLabel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[styles['dropdown-label'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <hr className={[styles['dropdown-separator'], className].filter(Boolean).join(' ')} />;
}
