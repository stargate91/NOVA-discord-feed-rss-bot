"use client";

import React, { useState, useRef, useEffect } from "react";
import { signIn, signOut } from "next-auth/react";
import { LogOut, ChevronDown, Shield } from "lucide-react";
import { Button, Avatar } from "@/components/ui";

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
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            padding: "0.25rem 0.75rem 0.25rem 0.25rem",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            cursor: "pointer",
            transition: "var(--transition-fast)",
          }}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <Avatar
            src={session.user?.image}
            alt={session.user?.name || "User"}
            size="sm"
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-weight-semibold)",
              maxWidth: "8rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {session.user?.name}
          </span>
          <ChevronDown
            size={14}
            style={{
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
              color: "var(--text-muted)",
            }}
          />
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + var(--space-2xs))",
              right: 0,
              width: "14rem",
              padding: "var(--space-xs)",
              borderRadius: "var(--radius-xl)",
              background: "var(--bg-card-strong)",
              border: "1px solid var(--border-accent)",
              boxShadow: "var(--shadow-xl)",
              backdropFilter: "blur(var(--blur-xl))",
              zIndex: "var(--z-dropdown)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2xs)",
            }}
          >
            <div style={{ padding: "var(--space-xs) var(--space-sm)" }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-2xs)",
                  color: "var(--text-muted)",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user?.email || "Logged in"}
              </p>
            </div>

            <div
              style={{
                height: "1px",
                background: "var(--border-subtle)",
                margin: "0.25rem 0",
              }}
            />

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              leftIcon={<LogOut size={14} />}
              style={{ color: "var(--status-error)", justifyContent: "flex-start" }}
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
            >
              Sign Out
            </Button>
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
