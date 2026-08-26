"use client";

import React from "react";
import Link from "next/link";
import { RAW_NAV_ITEMS } from "@/constants/navigation";
import { useNavigation } from "@/hooks/use_navigation";
import { useIsMounted } from "@/hooks";

interface NavLinksProps {
  session?: any;
  isMaster?: boolean;
  onItemClick?: () => void;
}

export default function NavLinks({ session, isMaster = false, onItemClick }: NavLinksProps) {
  const mounted = useIsMounted();
  const { navItems } = useNavigation(session, isMaster);

  if (!mounted) {
    return (
      <ul className="nav-links">
        {RAW_NAV_ITEMS.filter((item) => !item.requiresMaster).map((item) => {
          const Icon = item.icon;
          const extraClass = item.isPremium ? "premium-link" : "";
          return (
            <li key={item.id}>
              <div className={`nav-link skeleton ${extraClass}`.trim()}>
                <Icon size={20} className="nav-icon" />
                <span className="link-text">{item.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="nav-links">
      {navItems.map((item) => {
        const Icon = item.icon;
        const extraClass = item.isPremium ? "premium-link" : item.isDev ? "dev-link" : "";
        const activeClass = item.isActive ? "active" : "";

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`nav-link ${extraClass} ${activeClass}`.trim()}
              title={item.title}
              onClick={onItemClick}
            >
              <Icon size={20} className="nav-icon" />
              <span className="link-text">{item.label}</span>
            </Link>
          </li>
        );
      })}

      {!session && <li className="nav-info">Log in to see more.</li>}
    </ul>
  );
}
