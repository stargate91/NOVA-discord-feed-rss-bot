"use client";

import React from "react";
import { ChevronDown, Search } from "lucide-react";
import { DiscordRole } from "@/types/guild";
import { Input } from "@/components/ui";
import { useRoleSelect } from "@/hooks/use_role_select";
import { discordColorToHex } from "@/utils";
import styles from "./custom_role_select.module.css";

export interface CustomRoleSelectProps {
  roles: DiscordRole[];
  value: string;
  onChange: (value: string) => void;
}

export function CustomRoleSelect(props: CustomRoleSelectProps) {
  const {
    isOpen,
    search,
    setSearch,
    dropdownRef,
    selectedRole,
    filteredRoles,
    selectedColor,
    handleSelectRole,
    handleSelectNone,
    toggleDropdown,
  } = useRoleSelect(props);

  return (
    <div className={styles["role-select-wrapper"]} ref={dropdownRef}>
      <button
        type="button"
        className={styles["role-trigger"]}
        onClick={toggleDropdown}
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
              (props.value === "0" || !props.value) && styles.active,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleSelectNone}
          >
            <div className={`${styles["role-dot"]} ${styles["role-dot-none"]}`} />
            <span>None (Owner & Admins only)</span>
          </button>

          {filteredRoles.map((role) => {
            const roleColor = discordColorToHex(role.color);
            return (
              <button
                type="button"
                key={role.id}
                className={[
                  styles["role-option"],
                  props.value === role.id && styles.active,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleSelectRole(role.id)}
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

