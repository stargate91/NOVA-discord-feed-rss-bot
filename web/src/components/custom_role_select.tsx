"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { DiscordRole } from "@/types/guild";
import { Input } from "@/components/ui";
import styles from "./custom_role_select.module.css";

export interface CustomRoleSelectProps {
  roles: DiscordRole[];
  value: string;
  onChange: (value: string) => void;
}

export function CustomRoleSelect({ roles, value, onChange }: CustomRoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedRole = roles.find((r) => r.id === value);
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedColor = selectedRole?.color
    ? `#${selectedRole.color.toString(16).padStart(6, "0")}`
    : "var(--border-subtle)";

  return (
    <div className={styles["role-select-wrapper"]} ref={dropdownRef}>
      <button
        type="button"
        className={styles["role-trigger"]}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles["role-value-box"]}>
          <svg width="10" height="10" viewBox="0 0 10 10" className={styles["role-dot"]} aria-hidden="true">
            <circle cx="5" cy="5" r="5" fill={selectedColor} />
          </svg>
          <span>
            {selectedRole ? selectedRole.name : "None (Owner & Admins only)"}
          </span>
        </div>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className={styles["role-menu"]}>
          <div className={styles["role-search-wrap"]}>
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>

          <button
            type="button"
            className={[
              styles["role-option"],
              (value === "0" || !value) && styles.active,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              onChange("0");
              setIsOpen(false);
            }}
          >
            <div className={`${styles["role-dot"]} ${styles["role-dot-none"]}`} />
            <span>None (Owner & Admins only)</span>
          </button>

          {filteredRoles.map((role) => {
            const roleColor = role.color
              ? `#${role.color.toString(16).padStart(6, "0")}`
              : "var(--text-muted)";
            return (
              <button
                type="button"
                key={role.id}
                className={[
                  styles["role-option"],
                  value === role.id && styles.active,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onChange(role.id);
                  setIsOpen(false);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" className={styles["role-dot"]} aria-hidden="true">
                  <circle cx="5" cy="5" r="5" fill={roleColor} />
                </svg>
                <span>{role.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomRoleSelect;
