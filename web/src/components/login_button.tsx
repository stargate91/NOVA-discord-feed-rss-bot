"use client";

import React, { useState, useRef, useEffect } from "react";
import { signIn, signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import styles from "./login_button.module.css";

interface LoginButtonProps {
  session?: any;
  isMobile?: boolean;
}

export default function LoginButton({ session, isMobile }: LoginButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (session) {
    if (isMobile) {
      return (
        <Button
          variant="danger"
          size="md"
          fullWidth
          leftIcon={<LogOut size={18} />}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </Button>
      );
    }

    return (
      <div className={styles.container} ref={dropdownRef}>
        <button
          className={styles["profile-btn"]}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <Avatar
            src={session.user?.image}
            alt={session.user?.name || "User"}
            size="sm"
          />
          <span className={styles["user-name"]}>
            {session.user?.name}
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
                {session.user?.email || "Logged in"}
              </p>
            </div>

            <div className={styles.divider} />

            <button
              type="button"
              className={styles["signout-btn"]}
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
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
      onClick={() => signIn("discord", { callbackUrl: "/servers" })}
    >
      Login with Discord
    </Button>
  );
}
