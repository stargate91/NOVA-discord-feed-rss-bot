"use client";

import React, { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { GuildAvatar } from "@/components/ui";
import { useGuildSwitch } from "@/hooks/use_guild_switch";
import styles from "./guild_switcher.module.css";

interface GuildSwitcherProps {
  isMaster?: boolean;
}

const emptySubscribe = () => () => {};

export default function GuildSwitcher({ isMaster: _isMaster }: GuildSwitcherProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const router = useRouter();

  const {
    isOpen,
    setIsOpen,
    dropdownRef,
    currentGuildId,
    currentGuild,
    activeGuilds,
    loading,
    handleSelect,
  } = useGuildSwitch();

  if (!mounted) {
    return (
      <div className={styles["switcher-wrapper"]} ref={dropdownRef}>
        <button className={styles["toggle-btn"]} disabled type="button">
          <span className={styles["loading-text"]}>Loading servers...</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles["switcher-wrapper"]} ref={dropdownRef}>
      <button
        className={`${styles["toggle-btn"]} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles["toggle-content"]}>
          {currentGuild ? (
            <>
              <GuildAvatar guild={currentGuild} size="sm" />
              <span className={styles["guild-name"]}>{currentGuild.name}</span>
            </>
          ) : loading && currentGuildId ? (
            <span className={styles["loading-text"]}>Loading...</span>
          ) : (
            <>
              <div className={styles["guild-fallback"]}>
                <Globe size={16} />
              </div>
              <span className={styles["guild-name"]}>Select Server</span>
            </>
          )}
        </div>
        <ChevronDown size={16} className={`${styles["arrow-icon"]} ${isOpen ? styles.rotated : ''}`} />
      </button>

      {isOpen && (
        <div className={styles["dropdown-menu"]}>
          <div className={styles["items-list"]}>
            {loading ? (
              <div className={styles["empty-state"]}>Loading servers...</div>
            ) : activeGuilds.length > 0 ? (
              activeGuilds.map((guild) => (
                <button
                  key={guild.id}
                  type="button"
                  className={`${styles["select-item"]} ${currentGuildId === guild.id ? styles.selected : ''}`}
                  onClick={() => handleSelect(guild.id)}
                >
                  <GuildAvatar guild={guild} size="sm" />
                  <div className={styles["item-info"]}>
                    <span className={styles["item-name"]}>{guild.name}</span>
                    <span className={styles["online-tag"]}>● Online</span>
                  </div>
                </button>
              ))
            ) : (
              <div className={styles["empty-state"]}>No servers found.</div>
            )}
          </div>

          <div className={styles["dropdown-footer"]}>
            <button
              type="button"
              className={styles["view-all-btn"]}
              onClick={() => { setIsOpen(false); router.push('/servers'); }}
            >
              View All Servers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
