import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, Send, Award, ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Grid,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";
import StatCard from "@/components/stat_card";
import UsageIndicator from "@/components/usage_indicator";
import QuickActions from "@/components/quick_actions";
import EmptyStateCard from "@/components/empty_state_card";
import dashboardService from "@/services/dashboard_service";
import { getDashboardTierMeta } from "@/utils/tier_limits";
import styles from "./dashboard.module.css";

interface GuildDashboardPageProps {
  params: Promise<{ guildId: string }>;
}

export default async function GuildDashboardPage({ params }: GuildDashboardPageProps) {
  const session = await getServerSession(authOptions);
  const { guildId } = await params;

  if (!session) {
    redirect("/");
  }

  if (!guildId) {
    redirect("/servers");
  }

  const stats: any = await dashboardService.getGuildStats(guildId, session);

  if (stats?.error) {
    return (
      <div className={styles["dashboard-content"]}>
        <EmptyState
          icon={<Activity size={36} />}
          title="Dashboard Error"
          description={stats.error}
          action={
            <Link href="/servers">
              <Button variant="primary">Back to Server List</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const {
    isMaster,
    isPremium,
    effectiveMaxMonitors,
    badgeVariant,
    upgradeTitle,
    upgradeDesc,
  } = getDashboardTierMeta(stats);

  return (
    <div className={styles["dashboard-content"]}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Dashboard Overview"
        description={`Welcome back, ${session.user?.name || "Server Admin"}. Here is your live feed activity.`}
        badge={
          isMaster ? (
            <Badge variant="master" size="sm" icon={<ShieldCheck size={12} />}>
              Master Tier
            </Badge>
          ) : isPremium ? (
            <Badge variant="warning" size="sm" dot>
              {stats?.tierName}
            </Badge>
          ) : (
            <Badge variant={badgeVariant} size="sm">
              Free Plan
            </Badge>
          )
        }
      />

      {/* ── Stat Cards Grid ── */}
      <div className={styles["stats-grid"]}>
        <Grid columns={3} gap="lg">
          <StatCard
            title="Active Monitors"
            value={stats ? stats.activeMonitors : "0"}
            description="Actively tracking feeds"
            icon={Activity}
          />
          <StatCard
            title="Messages Sent"
            value={stats ? stats.totalPosts.toLocaleString() : "0"}
            description="Lifetime delivered notifications"
            icon={Send}
          />
          <StatCard
            title="Plan Status"
            value={stats?.tierName || "Free"}
            description={
              isMaster
                ? "Unlimited capacity & 1-minute speed"
                : `${stats?.maxMonitors || 2} feeds • ${stats?.refreshInterval || 20}m refresh`
            }
            actionButton={
              stats?.tier === 0 && !isMaster ? "Upgrade Plan" : undefined
            }
            actionHref={`/dashboard/${guildId}/billing`}
            icon={Award}
          />
        </Grid>
      </div>

      {/* ── Main Layout ── */}
      <div className={styles["main-grid"]}>
        <div className={styles["main-left"]}>
          {stats?.totalMonitorsCount === 0 && (
            <EmptyStateCard guildId={guildId} />
          )}

          {/* Plan Usage & Limits Card */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Plan Usage & Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageIndicator
                label="Active Feeds"
                current={stats?.totalMonitorsCount || 0}
                max={effectiveMaxMonitors}
                unit="monitors"
              />
              <p className={styles["usage-desc"]}>
                {isMaster ? (
                  <span>
                    Your server has <strong>Master Access</strong> with
                    unlimited monitor capacity and dedicated priority queues.
                  </span>
                ) : (
                  <span>
                    Your current <strong>{stats?.tierName}</strong> plan allows
                    up to <strong>{stats?.maxMonitors}</strong> monitors.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Upgrade Banner for non-lifetime / lower tiers */}
          {!isMaster && (stats?.tier ?? 0) < 3 && (
            <Card variant="elevated" className={styles["upgrade-card"]}>
              <CardContent>
                <div className={styles["upgrade-content"]}>
                  <div className={styles["upgrade-info"]}>
                    <span className={styles["upgrade-title"]}>
                      {upgradeTitle}
                    </span>
                    <p className={styles["upgrade-desc"]}>
                      {upgradeDesc}
                    </p>
                  </div>
                  <Link href={`/dashboard/${guildId}/billing`}>
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight size={16} />}
                    >
                      {stats?.tier === 0 ? "Upgrade Now" : "View Plans"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className={styles["main-right"]}>
          <QuickActions guildId={guildId} />
        </div>
      </div>
    </div>
  );
}
