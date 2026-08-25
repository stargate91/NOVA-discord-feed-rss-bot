import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
import DashboardOnboardingCard from "@/components/dashboard_onboarding_card";
import { getGuildDashboardData } from "@/lib/server/dashboard";
import styles from "./dashboard.module.css";

interface GuildDashboardPageProps {
  params: Promise<{ guildId: string }>;
}

export default async function GuildDashboardPage({ params }: GuildDashboardPageProps) {
  const session = await getServerSession(authOptions);
  const { guildId } = await params;

  const { stats, tierMeta, error } = await getGuildDashboardData(guildId, session);

  if (error) {
    return (
      <div className={styles["dashboard-content"]}>
        <EmptyState
          icon={<Activity size={36} />}
          title="Dashboard Error"
          description={error}
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
    effectiveMaxMonitors,
    badgeVariant,
    badgeLabel,
    badgeHasDot,
    upgradeTitle,
    upgradeDesc,
    planStatusDescription,
    planActionLabel,
    upgradeButtonLabel,
    canUpgrade,
  } = tierMeta;

  return (
    <div className={styles["dashboard-content"]}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Dashboard Overview"
        description={`Welcome back, ${session?.user?.name || "Server Admin"}. Here is your live feed activity.`}
        badge={
          <Badge
            variant={badgeVariant}
            size="sm"
            dot={badgeHasDot}
            icon={isMaster ? <ShieldCheck size={12} /> : undefined}
          >
            {badgeLabel}
          </Badge>
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
            description={planStatusDescription}
            actionButton={planActionLabel}
            actionHref={`/dashboard/${guildId}/billing`}
            icon={Award}
          />
        </Grid>
      </div>

      {/* ── Main Layout ── */}
      <div className={styles["main-grid"]}>
        <div className={styles["main-left"]}>
          {stats?.totalMonitorsCount === 0 && (
            <DashboardOnboardingCard guildId={guildId} />
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
                    Your current <strong>{stats?.tierName || "Free"}</strong> plan allows
                    up to <strong>{stats?.maxMonitors || 2}</strong> monitors.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Upgrade Banner for non-lifetime / lower tiers */}
          {canUpgrade && (
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
                      {upgradeButtonLabel}
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
