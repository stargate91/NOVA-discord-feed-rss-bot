"use client";

import React, { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Globe } from "lucide-react";
import { getGuildIconUrl } from "@/utils";
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
              {currentGuild.icon ? (
                <Image
                  src={getGuildIconUrl(currentGuild.id, currentGuild.icon, 128) || ''}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className={styles["guild-icon"]}
                />
              ) : (
                <div className={styles["guild-fallback"]}>
                  {currentGuild.name.substring(0, 1)}
                </div>
              )}
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
                  {guild.icon ? (
                    <Image
                      src={getGuildIconUrl(guild.id, guild.icon, 128) || ''}
                      alt=""
                      width={32}
                      height={32}
                      unoptimized
                      className={styles["guild-icon"]}
                    />
                  ) : (
                    <div className={styles["guild-fallback"]}>
                      {guild.name.substring(0, 1)}
                    </div>
                  )}
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
