"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Server,
  Crown,
  Shield,
  Plus,
  ChevronRight,
  Search,
  RefreshCw,
  LogOut,
  AlertTriangle,
  X,
} from "lucide-react";
import { PublicLayout } from "@/components/layout";
import {
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Avatar,
  EmptyState,
  Spinner,
  Inline,
  Stack,
  IconButton,
} from "@/components/ui";
import { GuildInfo } from "@/types/guild";
import guildService from "@/services/guildService";
import { getGuildIconUrl } from "@/utils";
import styles from "./servers.module.css";

export default function ServersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Array<GuildInfo & { hasBot?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchGuilds();
    }
  }, [status]);

  const fetchGuilds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guildService.getGuilds();
      setGuilds(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load Discord servers");
      console.error("Guild fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (guildId: string) => {
    router.push(`/dashboard/${guildId}`);
  };

  // Filter & Sort: installed active servers first, then sorted by name
  const filteredGuilds = useMemo(() => {
    return guilds
      .filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
      .sort((a, b) => {
        const aHas = Boolean(a.hasBot || a.bot_in_guild);
        const bHas = Boolean(b.hasBot || b.bot_in_guild);
        if (aHas === bHas) return a.name.localeCompare(b.name);
        return bHas ? 1 : -1;
      });
  }, [guilds, searchQuery]);

  return (
    <PublicLayout session={session}>
      <div className={["ui-container", styles["servers-container"]].join(" ")}>
        {/* ── Header ── */}
        <header className={styles["servers-header"]}>
          <Badge variant="primary" size="md" icon={<Server size={14} />}>
            SERVER HUB
          </Badge>

          <Heading level={1} size="5xl" weight="black">
            Your <span className={styles["text-gradient"]}>Servers</span>
          </Heading>

          <Text
            as="p"
            size="lg"
            variant="secondary"
            className={styles["servers-lead"]}
          >
            Choose a Discord server to manage its feeds, monitors, and automated
            notifications.
          </Text>
        </header>

        {/* ── Search Bar ── */}
        {!loading && guilds.length > 0 && (
          <div className={styles["search-bar-wrapper"]}>
            <Input
              placeholder="Search by server name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              rightIcon={
                searchQuery ? (
                  <IconButton
                    icon={<X size={14} />}
                    size="xs"
                    variant="ghost"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                  />
                ) : undefined
              }
            />
          </div>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <Stack align="center" justify="center" gap="lg" style={{ paddingBlock: "4rem" }}>
            <Spinner size="lg" label="Loading Discord servers..." />
          </Stack>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <EmptyState
            icon={<AlertTriangle size={36} />}
            title="Connection Error"
            description={error}
            action={
              <Inline gap="sm" wrap justify="center">
                <Button
                  variant="primary"
                  leftIcon={<RefreshCw size={16} />}
                  onClick={fetchGuilds}
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<LogOut size={16} />}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Re-login
                </Button>
              </Inline>
            }
          />
        )}

        {/* ── Server List ── */}
        {!loading && !error && filteredGuilds.length > 0 && (
          <div className={styles["guild-list"]}>
            {filteredGuilds.map((guild) => {
              const hasBot = Boolean(guild.hasBot || guild.bot_in_guild);
              const iconUrl = getGuildIconUrl(guild.id, guild.icon, 128);
              const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1489908793780338688"}&permissions=3387582172359760&response_type=code&redirect_uri=https%3A%2F%2Fnovafeeds.xyz%2Fapi%2Fauth%2Fcallback%2Fdiscord&integration_type=0&scope=identify+guilds+bot+applications.commands&guild_id=${guild.id}`;

              return (
                <div
                  key={guild.id}
                  className={[
                    styles["guild-card"],
                    guild.isPremium && styles["premium-card"],
                    !hasBot && styles.uninstalled,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => hasBot && handleSelect(guild.id)}
                  tabIndex={hasBot ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (hasBot && (e.key === "Enter" || e.key === " ")) {
                      handleSelect(guild.id);
                    }
                  }}
                  role={hasBot ? "button" : undefined}
                >
                  <div className={styles["guild-left"]}>
                    <Avatar
                      src={iconUrl}
                      alt={guild.name}
                      shape="square"
                      size="lg"
                      fallback={guild.name.slice(0, 2).toUpperCase()}
                      status={hasBot ? "online" : undefined}
                    />

                    <div className={styles["guild-info"]}>
                      <span className={styles["guild-name"]}>{guild.name}</span>
                      <div className={styles["guild-badges"]}>
                        {guild.isMaster && (
                          <Badge
                            variant="master"
                            size="sm"
                            icon={<Shield size={10} />}
                          >
                            Master
                          </Badge>
                        )}
                        {guild.isPremium && (
                          <Badge
                            variant="warning"
                            size="sm"
                            icon={<Crown size={10} />}
                          >
                            Premium
                          </Badge>
                        )}
                        {!hasBot && (
                          <Badge variant="neutral" size="sm">
                            Not Installed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles["guild-right"]}>
                    {hasBot ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<ChevronRight size={18} />}
                      >
                        Manage
                      </Button>
                    ) : (
                      <a
                        href={botInviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Plus size={16} />}
                        >
                          Invite Bot
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && filteredGuilds.length === 0 && (
          <EmptyState
            icon={<Server size={36} />}
            title={
              searchQuery
                ? `No servers matching "${searchQuery}"`
                : "No servers found"
            }
            description={
              searchQuery
                ? "Try searching for a different server name."
                : "Make sure your Discord account has Administrator or Manage Server permissions."
            }
            action={
              searchQuery ? (
                <Button variant="secondary" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Button
                  variant="primary"
                  leftIcon={<RefreshCw size={16} />}
                  onClick={fetchGuilds}
                >
                  Refresh Servers
                </Button>
              )
            }
          />
        )}
      </div>
    </PublicLayout>
  );
}
