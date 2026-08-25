"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Globe } from "lucide-react";
import { GuildInfo } from "@/types/guild";
import guildService from "@/services/guild_service";
import { getGuildIconUrl } from "@/utils";
import styles from "./guild_switcher.module.css";

interface GuildSwitcherProps {
  isMaster?: boolean;
}

const emptySubscribe = () => () => {};

export default function GuildSwitcher({ isMaster: _isMaster }: GuildSwitcherProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);
  const [guilds, setGuilds] = useState<Array<GuildInfo & { hasBot?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const currentGuildId = (params?.guildId as string) || "";

  // Fetch guilds for the dropdown
  useEffect(() => {
    let ignore = false;
    async function fetchGuilds() {
      try {
        const data = await guildService.getGuilds();
        if (!ignore) {
          setGuilds(data);
        }
      } catch (err) {
        console.error("Failed to fetch guilds for switcher:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    fetchGuilds();
    return () => {
      ignore = true;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentGuild = guilds.find(g => g.id === currentGuildId);

  if (!mounted) {
    return (
      <div className={styles["switcher-wrapper"]} ref={dropdownRef}>
        <button className={styles["toggle-btn"]} disabled type="button">
          <span className={styles["loading-text"]}>Loading servers...</span>
        </button>
      </div>
    );
  }

  const handleSelect = (id: string) => {
    setIsOpen(false);
    if (id === "global") {
      router.push("/servers");
      return;
    }

    // Try to preserve current subtab if applicable (e.g. /monitors, /settings)
    if (pathname && currentGuildId) {
      const subpath = pathname.replace(`/dashboard/${currentGuildId}`, "");
      if (subpath && !subpath.startsWith("?")) {
        router.push(`/dashboard/${id}${subpath}`);
        return;
      }
    }

    router.push(`/dashboard/${id}`);
  };

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
            ) : guilds.filter(g => g.hasBot || g.bot_in_guild).length > 0 ? (
              guilds.filter(g => g.hasBot || g.bot_in_guild).map((guild) => (
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
