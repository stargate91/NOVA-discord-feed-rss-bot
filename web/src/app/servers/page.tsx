"use client";

import React from "react";
import { signOut } from "next-auth/react";
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
  GuildAvatar,
  EmptyState,
  Spinner,
  Inline,
  Stack,
  IconButton,
} from "@/components/ui";
import { useServerList } from "@/hooks/use_server_list";
import { getBotInviteUrl } from "@/utils";
import styles from "./servers.module.css";

export default function ServersPage() {
  const {
    session,
    guilds,
    filteredGuilds,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchGuilds,
    handleSelectGuild,
  } = useServerList();

  return (
    <PublicLayout session={session}>
      <div className={["ui-container", styles["servers-container"]].join(" ")}>
        {/* ── Header ── */}
        <header className={styles["servers-header"]}>
          <div className={styles["header-text-group"]}>
            <Heading level={1} size="4xl" weight="black">
              Your <span className="text-gradient">Servers</span>
            </Heading>
            <Text as="p" size="base" variant="secondary">
              Select a Discord server to configure feeds, alert templates, and notification channels.
            </Text>
          </div>

          <a
            href={getBotInviteUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add to Another Server
            </Button>
          </a>
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
          <Stack align="center" justify="center" gap="lg" className={styles["loading-stack"]}>
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
            {filteredGuilds.map((guild) => (
              <div
                key={guild.id}
                className={[
                  styles["guild-card"],
                  guild.isPremium && styles["premium-card"],
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleSelectGuild(guild.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectGuild(guild.id);
                  }
                }}
                role="button"
              >
                <div className={styles["guild-left"]}>
                  <GuildAvatar
                    guild={guild}
                    shape="square"
                    size="lg"
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
                      {guild.hasBot ? (
                        <Badge variant="success" size="sm" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Not Installed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles["guild-right"]}>
                  <Inline gap="xs" align="center">
                    {!guild.hasBot && (
                      <a
                        href={guild.botInviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Plus size={14} />}
                        >
                          Invite
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ChevronRight size={16} />}
                    >
                      Manage
                    </Button>
                  </Inline>
                </div>
              </div>
            ))}
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
