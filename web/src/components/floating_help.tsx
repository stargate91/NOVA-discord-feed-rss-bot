"use client";

import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, Book, MessageCircle, X, ExternalLink, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import styles from "./floating_help.module.css";

export default function FloatingHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const params = useParams();
  const guildId = (params?.guildId as string) || "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide on public premium page
  if (!guildId && pathname === "/premium") {
    return null;
  }

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const guideHref = guildId ? `/dashboard/${guildId}/guide` : "/premium";
  const faqHref = guildId ? `/dashboard/${guildId}/faq` : "/premium";

  return (
    <div className={styles["floating-container"]} ref={menuRef}>
      {isOpen && (
        <div className={styles["help-menu"]}>
          <div className={styles["menu-header"]}>
            <h3 className={styles["menu-title"]}>Support & Help</h3>
            <button 
              type="button"
              className={styles["menu-close-btn"]} 
              onClick={() => setIsOpen(false)}
              aria-label="Close help menu"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className={styles["menu-body"]}>
            <Link href={guideHref} onClick={() => setIsOpen(false)} className={styles["item-link"]}>
              <div className={styles["help-item"]}>
                <div className={styles["icon-wrap-purple"]}>
                  <Book size={18} />
                </div>
                <div className={styles["item-text"]}>
                  <h4 className={styles["item-heading"]}>Getting Started Guide</h4>
                  <p className={styles["item-subtext"]}>Step-by-step setup tutorial</p>
                </div>
                <ChevronRight size={14} className={styles["chevron-icon"]} />
              </div>
            </Link>

            <Link href={faqHref} onClick={() => setIsOpen(false)} className={styles["item-link"]}>
              <div className={styles["help-item"]}>
                <div className={styles["icon-wrap-blue"]}>
                  <MessageSquare size={18} />
                </div>
                <div className={styles["item-text"]}>
                  <h4 className={styles["item-heading"]}>FAQ</h4>
                  <p className={styles["item-subtext"]}>Common questions & answers</p>
                </div>
                <ChevronRight size={14} className={styles["chevron-icon"]} />
              </div>
            </Link>

            <a 
              href="https://discord.gg/PbvX3S7pXR" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles["item-link"]} ${styles["help-item"]}`}
            >
              <div className={styles["icon-wrap-discord"]}>
                <MessageCircle size={18} />
              </div>
              <div className={styles["item-text"]}>
                <h4 className={styles["item-heading"]}>Support Server</h4>
                <p className={styles["item-subtext"]}>Join our Discord community</p>
              </div>
              <ExternalLink size={14} className={styles["chevron-icon"]} />
            </a>
          </div>

          <div className={styles["menu-footer"]}>
            <p className={styles["version-text"]}>Version 2.4.0-beta</p>
          </div>
        </div>
      )}

      <button 
        className={`${styles["help-trigger"]} ${isOpen ? styles.active : ''}`} 
        onClick={toggleMenu}
        title="Help & Support"
        type="button"
        aria-label="Toggle help menu"
      >
        <HelpCircle size={28} />
      </button>
    </div>
  );
}
