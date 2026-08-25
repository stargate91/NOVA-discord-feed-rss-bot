"use client";

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Activity,
  Layers,
  Zap,
  Monitor,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Grid,
  SegmentedControl,
  Badge,
  Spinner,
  EmptyState,
  Stack,
  Text,
} from "@/components/ui";
import StatCard from "@/components/stat_card";
import HeatmapChart from "@/components/heatmap_chart";
import LiveTicker from "@/components/live_ticker";
import { ANALYTICS_RANGE_LABELS, ANALYTICS_PIE_COLORS } from "@/constants/navigation";
import { useGuildAnalytics } from "@/hooks/use_guild_analytics";
import styles from "./analytics.module.css";

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles["custom-tooltip"]}>
        <p className={styles["tooltip-label"]}>{label}</p>
        <p className={styles["tooltip-value"]}>
          <Zap size={14} />
          {payload[0].value.toLocaleString()} Posts
        </p>
      </div>
    );
  }
  return null;
};

function AnalyticsContent() {
  const params = useParams();
  const router = useRouter();
  const guildId = (params?.guildId as string) || "";

  const {
    data,
    loading,
    error,
    range,
    setRange,
    isRangeLocked,
    chartData,
    growthRate,
    formattedPlatforms,
  } = useGuildAnalytics(guildId);

  if (loading && !data) {
    return (
      <Stack align="center" justify="center" gap="lg" className={styles["loading-stack"]}>
        <Spinner size="lg" label="Loading analytics and delivery data..." />
      </Stack>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Activity size={36} />}
        title="Failed to load analytics"
        description={error}
      />
    );
  }

  if (!data) return null;

  return (
    <div className={styles["analytics-container"]}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Analytics & Delivery"
        description="Track your feed performance, volume metrics, and hourly peak activity."
        badge={
          <Badge variant="primary" size="sm">
            {data.platformCount} Active Sources
          </Badge>
        }
      />

      {/* ── Range Selector & Live Ticker ── */}
      <div className={styles["range-row"]}>
        <div className={styles["range-controls"]}>
          <Calendar size={16} color="var(--accent-light)" />
          <span className="text-caption">Time Range:</span>
          <SegmentedControl<string>
            value={range}
            onChange={(val) => {
              if (isRangeLocked(val)) {
                router.push(`/dashboard/${guildId}/billing`);
                return;
              }
              setRange(val);
            }}
            options={Object.entries(ANALYTICS_RANGE_LABELS).map(([val, label]) => ({
              value: val,
              label: (
                <span className={styles["range-label-badge"]}>
                  <span>{label}</span>
                  {isRangeLocked(val) && <Lock size={12} />}
                </span>
              ),
            }))}
          />
        </div>

        <div className={styles["ticker-container"]}>
          <LiveTicker />
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <Grid columns={4} gap="lg">
        <StatCard
          title="Total Messages"
          value={data.totalPosts.toLocaleString()}
          description="Overall delivered posts"
          trend={growthRate !== 0 ? { value: Math.abs(growthRate), isPositive: growthRate >= 0 } : undefined}
          icon={TrendingUp}
        />
        <StatCard
          title="Active Monitors"
          value={data.activeMonitors}
          description="Currently tracking"
          icon={Monitor}
        />
        <StatCard
          title="Platform Count"
          value={data.platformCount}
          description="Integrated sources"
          icon={Layers}
        />
        <StatCard
          title="System Health"
          value="Optimal"
          valueColor="var(--status-success)"
          description="All pipelines healthy"
          icon={Activity}
        />
      </Grid>

      {/* ── Main Charts Grid ── */}
      <div className={styles["charts-grid"]}>
        {/* Activity Area Chart */}
        <Card variant="elevated" className={styles["chart-card"]}>
          <CardHeader>
            <CardTitle>Message Activity Trend</CardTitle>
            <Text as="p" size="xs" variant="muted">
              Daily volume of posts delivered to your Discord channels.
            </Text>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPosts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution Pie */}
        <Card variant="elevated" className={styles["chart-card"]}>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <Text as="p" size="xs" variant="muted">
              Message share per feed source.
            </Text>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={formattedPlatforms}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={6}
                  stroke="none"
                >
                  {formattedPlatforms.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ANALYTICS_PIE_COLORS[index % ANALYTICS_PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Global Heatmap & Efficiency Grid ── */}
      <div className={styles["charts-grid"]}>
        {/* Heatmap Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Activity Heatmap</CardTitle>
            <Text as="p" size="xs" variant="muted">
              Hourly and daily distribution of incoming updates.
            </Text>
          </CardHeader>
          <CardContent>
            <HeatmapChart data={data.heatmap || []} />
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Source Breakdown</CardTitle>
            <Text as="p" size="xs" variant="muted">
              Comparative volume rankings.
            </Text>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.platforms || []}>
                <XAxis dataKey="displayName" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(data.platforms || []).map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ANALYTICS_PIE_COLORS[index % ANALYTICS_PIE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading..." />}>
      <AnalyticsContent />
    </Suspense>
  );
}
