"use client";

import React from "react";
import { HelpCircle, Book, MessageCircle, X, ExternalLink, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useFloatingHelp } from "@/hooks/use_floating_help";
import styles from "./floating_help.module.css";

export default function FloatingHelp() {
  const {
    isOpen,
    menuRef,
    isHidden,
    toggleMenu,
    closeMenu,
    guideHref,
    faqHref,
    supportDiscordUrl,
  } = useFloatingHelp();

  if (isHidden) {
    return null;
  }

  return (
    <div className={styles["floating-container"]} ref={menuRef}>
      {isOpen && (
        <div className={styles["help-menu"]}>
          <div className={styles["menu-header"]}>
            <h3 className={styles["menu-title"]}>Support & Help</h3>
            <button 
              type="button"
              className={styles["menu-close-btn"]} 
              onClick={closeMenu}
              aria-label="Close help menu"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className={styles["menu-body"]}>
            <Link href={guideHref} onClick={closeMenu} className={styles["item-link"]}>
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

            <Link href={faqHref} onClick={closeMenu} className={styles["item-link"]}>
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
              href={supportDiscordUrl} 
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
