"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Crown, 
  Monitor, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  Code,
  BookOpen
} from "lucide-react";

interface NavLinksProps {
  session?: any;
  isMaster?: boolean;
  onItemClick?: () => void;
}

const emptySubscribe = () => () => {};

export default function NavLinks({ session, isMaster = false, onItemClick }: NavLinksProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  // Determine active guildId from URL params or pathname
  const guildId = (params?.guildId as string) || searchParams?.get("guild") || "";

  const buildUrl = (subpath: string) => {
    if (!guildId) return subpath === "" ? "/servers" : `/${subpath}`;
    if (subpath === "") return `/dashboard/${guildId}`;
    return `/dashboard/${guildId}/${subpath}`;
  };

  const isActive = (subpath: string) => {
    const target = buildUrl(subpath);
    if (subpath === "") {
      return pathname === target;
    }
    return pathname === target || pathname?.startsWith(`${target}/`);
  };

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
      <li>
        <Link
          href={buildUrl("")}
          className={`nav-link ${isActive("") ? "active" : ""}`}
          title="Overview"
          onClick={onItemClick}
        >
          <LayoutDashboard size={20} className="nav-icon" />
          <span className="link-text">Dashboard</span>
        </Link>
      </li>

      {session ? (
        <>
          <li>
            <Link
              href={buildUrl("monitors")}
              className={`nav-link ${isActive("monitors") ? "active" : ""}`}
              title="Monitors"
              onClick={onItemClick}
            >
              <Monitor size={20} className="nav-icon" />
              <span className="link-text">Monitors</span>
            </Link>
          </li>
          <li>
            <Link
              href={buildUrl("analytics")}
              className={`nav-link ${isActive("analytics") ? "active" : ""}`}
              title="Analytics"
              onClick={onItemClick}
            >
              <BarChart2 size={20} className="nav-icon" />
              <span className="link-text">Analytics</span>
            </Link>
          </li>
          <li>
            <Link
              href={buildUrl("settings")}
              className={`nav-link ${isActive("settings") ? "active" : ""}`}
              title="Settings"
              onClick={onItemClick}
            >
              <Settings size={20} className="nav-icon" />
              <span className="link-text">Settings</span>
            </Link>
          </li>
          <li>
            <Link
              href={buildUrl("billing")}
              className={`nav-link premium-link ${isActive("billing") || isActive("premium") ? "active" : ""}`}
              title="Billing & Plans"
              onClick={onItemClick}
            >
              <Crown size={20} className="nav-icon" />
              <span className="link-text">Billing</span>
            </Link>
          </li>
          <li>
            <Link
              href={buildUrl("guide")}
              className={`nav-link ${isActive("guide") ? "active" : ""}`}
              title="Guide"
              onClick={onItemClick}
            >
              <BookOpen size={20} className="nav-icon" />
              <span className="link-text">Guide</span>
            </Link>
          </li>
          <li>
            <Link
              href={buildUrl("faq")}
              className={`nav-link ${isActive("faq") ? "active" : ""}`}
              title="FAQ"
              onClick={onItemClick}
            >
              <HelpCircle size={20} className="nav-icon" />
              <span className="link-text">FAQ</span>
            </Link>
          </li>

          {isMaster && (
            <li>
              <Link
                href={buildUrl("dev")}
                className={`nav-link dev-link ${isActive("dev") ? "active" : ""}`}
                title="Dev Controls"
                onClick={onItemClick}
              >
                <Code size={20} className="nav-icon" />
                <span className="link-text">Dev Controls</span>
              </Link>
            </li>
          )}
        </>
      ) : (
        <li className="nav-info">Log in to see more.</li>
      )}
    </ul>
  );
}
