"use client";

import React from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { useLoginButton } from "@/hooks/use_login_button";
import styles from "./login_button.module.css";

interface LoginButtonProps {
  session?: any;
  isMobile?: boolean;
}

export default function LoginButton({ session, isMobile }: LoginButtonProps) {
  const {
    isOpen,
    dropdownRef,
    displayName,
    displayEmail,
    handleLogin,
    handleLogout,
    toggleDropdown,
  } = useLoginButton({ session });

  if (session) {
    if (isMobile) {
      return (
        <Button
          variant="danger"
          size="md"
          fullWidth
          leftIcon={<LogOut size={18} />}
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      );
    }

    return (
      <div className={styles.container} ref={dropdownRef}>
        <button
          className={styles["profile-btn"]}
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <Avatar
            src={session.user?.image}
            alt={displayName}
            size="sm"
          />
          <span className={styles["user-name"]}>
            {displayName}
          </span>
          <ChevronDown
            size={14}
            className={`${styles["chevron-icon"]} ${isOpen ? styles.rotated : ''}`}
          />
        </button>

        {isOpen && (
          <div className={styles["dropdown-card"]}>
            <div className={styles["email-wrap"]}>
              <p className={styles["email-text"]}>
                {displayEmail}
              </p>
            </div>

            <div className={styles.divider} />

            <button
              type="button"
              className={styles["signout-btn"]}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleLogin}
    >
      Login with Discord
    </Button>
  );
}
