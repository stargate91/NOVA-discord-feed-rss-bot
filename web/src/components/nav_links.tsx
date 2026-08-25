"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { LayoutDashboard, Monitor, BarChart2, Settings, Crown, HelpCircle } from "lucide-react";
import { useNavigation } from "@/hooks/use_navigation";

interface NavLinksProps {
  session?: any;
  isMaster?: boolean;
  onItemClick?: () => void;
}

const emptySubscribe = () => () => {};

export default function NavLinks({ session, isMaster = false, onItemClick }: NavLinksProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { navItems } = useNavigation(session, isMaster);

  if (!mounted) {
    return (
      <ul className="nav-links">
        <li><div className="nav-link skeleton"><LayoutDashboard size={20} className="nav-icon" /><span className="link-text">Dashboard</span></div></li>
        <li><div className="nav-link skeleton"><Monitor size={20} className="nav-icon" /><span className="link-text">Monitors</span></div></li>
        <li><div className="nav-link skeleton"><BarChart2 size={20} className="nav-icon" /><span className="link-text">Analytics</span></div></li>
        <li><div className="nav-link skeleton"><Settings size={20} className="nav-icon" /><span className="link-text">Settings</span></div></li>
        <li><div className="nav-link premium-link skeleton"><Crown size={20} className="nav-icon" /><span className="link-text">Billing</span></div></li>
        <li><div className="nav-link skeleton"><HelpCircle size={20} className="nav-icon" /><span className="link-text">FAQ</span></div></li>
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
