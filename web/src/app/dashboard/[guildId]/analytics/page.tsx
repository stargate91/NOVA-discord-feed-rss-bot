"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Cell, PieChart, Pie, BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { 
  Calendar,
  ChevronDown,
  TrendingUp,
  Activity,
  Layers,
  Zap,
  ArrowUpRight,
  Monitor,
  Lock
} from 'lucide-react';
import LiveTicker from "@/components/LiveTicker";
import HeatmapChart from "@/components/HeatmapChart";
import { useSession } from "next-auth/react";
import { ANALYTICS_RANGE_LABELS, ANALYTICS_PIE_COLORS } from "@/constants/navigation";
import analyticsService, { AnalyticsData } from "@/services/analyticsService";
import LoginButton from "@/components/LoginButton";
import styles from "./analytics.module.css";

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>
          <Zap size={14} fill="var(--accent-color)" stroke="var(--accent-color)" />
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
  const guildId = (params?.guildId as string) || '';
  const { data: session } = useSession();
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('3'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasSetDefaultRange, setHasSetDefaultRange] = useState(false);

  const isRangeLocked = (val: string) => {
    if ((session?.user as any)?.role === "master") return false;
    if (!data) return true;
    if (data.isMaster || (data.tier ?? 0) >= 3) return false;
    
    const limit = analyticsService.getTierLimit(data.tier || 0);
    return parseInt(val, 10) > limit;
  };

  useEffect(() => {
    if (!guildId) {
      router.push("/servers");
      return;
    }

    async function fetchStats() {
      setLoading(true);
      try {
        const json = await analyticsService.getStats(guildId!, range);
        setData(json);

        if (!hasSetDefaultRange && json) {
          const limit = ((session?.user as any)?.role === 'master' || json.isMaster || (json.tier ?? 0) >= 3) 
            ? 999 
            : analyticsService.getTierLimit(json.tier || 0);
          setRange(String(limit));
          setHasSetDefaultRange(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [guildId, range, router, session, hasSetDefaultRange]);

  const chartData = useMemo(() => {
    if (!data || !data.history) return [];
    return data.history.map(item => ({
      date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      posts: parseInt(String(item.count), 10)
    }));
  }, [data]);

  if (loading && !data) return <div className="loading-container"><div className="loader"></div></div>;
  if (error) return <div className="error-container"><h3>Error: {error}</h3></div>;
  if (!data) return null;

  return (
    <div className={styles.analyticsWrapper} onClick={() => setIsDropdownOpen(false)}>
      <header className="ui-dashboard-header">
        <div className="ui-dashboard-info">
          <h1 className="ui-dashboard-title">Analytics Dashboard</h1>
          <p className="ui-dashboard-subtitle">Track your feed performance, engagement metrics, and delivery statistics.</p>
        </div>

        <div className={styles.tickerWrapper}>
          <LiveTicker />
        </div>

        <div className={styles.headerRightActions}>
          <div className={styles.rangeDropdownContainer}>
            <button 
              className={styles.dropdownTrigger}
              onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
            >
              <Calendar size={18} />
              <span>{ANALYTICS_RANGE_LABELS[range] || `${range} Days`}</span>
              <ChevronDown size={16} className={isDropdownOpen ? styles.rotate : ''} />
            </button>
            
            {isDropdownOpen && (
              <div className={styles.rangeDropdown}>
                {Object.entries(ANALYTICS_RANGE_LABELS).map(([val, label]) => {
                  const locked = isRangeLocked(val);
                  return (
                    <button 
                      key={val} 
                      className={`${range === val ? styles.active : ''} ${locked ? styles.locked : ''}`} 
                      onClick={() => { 
                        if (locked) {
                          router.push(`/dashboard/${guildId}/billing`);
                          return;
                        }
                        setRange(val); 
                        setIsDropdownOpen(false); 
                      }}
                    >
                      <span>{label}</span>
                      {locked && <Lock size={12} className={styles.lockIcon} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          <LoginButton session={session} />
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className="ui-stat-card-premium">
           <div className={styles.statIconBg} style={{ '--color': '#7b2cbf' } as React.CSSProperties}>
              <TrendingUp size={24} color="#7b2cbf" />
           </div>
           <div className={styles.statInfo}>
              <span className="ui-stat-label">Total Messages</span>
              <div className="ui-stat-value" style={{ fontSize: '1.8rem' }}>{data.totalPosts.toLocaleString()}</div>
              <span className={styles.statChange}><ArrowUpRight size={14} /> Overall Activity</span>
           </div>
        </div>

        <div className="ui-stat-card-premium">
           <div className={styles.statIconBg} style={{ '--color': '#9d4edd' } as React.CSSProperties}>
              <Monitor size={24} color="#9d4edd" />
           </div>
           <div className={styles.statInfo}>
              <span className="ui-stat-label">Active Monitors</span>
              <div className="ui-stat-value" style={{ fontSize: '1.8rem' }}>{data.activeMonitors}</div>
              <span className={styles.statChange}>Currently Monitoring</span>
           </div>
        </div>

        <div className="ui-stat-card-premium">
           <div className={styles.statIconBg} style={{ '--color': '#5a189a' } as React.CSSProperties}>
              <Layers size={24} color="#5a189a" />
           </div>
           <div className={styles.statInfo}>
              <span className="ui-stat-label">Platform Count</span>
              <div className="ui-stat-value" style={{ fontSize: '1.8rem' }}>{data.platformCount}</div>
              <span className={styles.statChange}>Across all sources</span>
           </div>
        </div>

        <div className="ui-stat-card-premium">
           <div className={styles.statIconBg} style={{ '--color': '#10b981' } as React.CSSProperties}>
              <Activity size={24} color="#10b981" />
           </div>
           <div className={styles.statInfo}>
              <span className="ui-stat-label">System Health</span>
              <div className="ui-stat-value" style={{ fontSize: '1.8rem', color: '#10b981' }}>Optimal</div>
              <span className={styles.statChange} style={{ color: '#10b981' }}>All systems operational</span>
           </div>
        </div>
      </div>

      <div className={styles.mainChartsGrid}>
        <div className="ui-card">
           <div className="ui-card-glow"></div>
           <div className={styles.chartHeaderInner}>
              <h3 className="ui-monitor-name">Message Activity Trend</h3>
              <p className="ui-dashboard-subtitle">Daily breakdown of posts sent to your Discord server.</p>
           </div>
           <div className={styles.chartContentInner} style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7b2cbf" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7b2cbf" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="posts" 
                    stroke="#7b2cbf" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPosts)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="ui-card">
           <div className="ui-card-glow"></div>
           <div className={styles.chartHeaderInner}>
              <h3 className="ui-monitor-name">Platform Distribution</h3>
              <p className="ui-dashboard-subtitle">Message volume per source.</p>
           </div>
           <div className={styles.chartContentInner} style={{ flex: 1 }}>
              <div className={styles.pieContainerVertical}>
                 <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.platforms || []}
                        dataKey="count"
                        nameKey="displayName"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={8}
                        stroke="none"
                      >
                        {(data.platforms || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={ANALYTICS_PIE_COLORS[index % ANALYTICS_PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className={styles.pieLegendGrid}>
                    {(data.platforms || []).map((p: any, i: number) => (
                       <div key={p.platform} className={styles.legendItem}>
                          <div className={styles.dot} style={{ background: ANALYTICS_PIE_COLORS[i % ANALYTICS_PIE_COLORS.length] }}></div>
                          <span className={styles.name}>{p.displayName}</span>
                          <span className={styles.val}>{p.count}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="ui-card">
           <div className="ui-card-glow"></div>
           <div className={styles.chartHeaderInner}>
              <h3 className="ui-monitor-name">Global Heatmap</h3>
              <p className="ui-dashboard-subtitle">Peak activity hours and days for your feed monitors.</p>
           </div>
           <div className={styles.chartContentInner} style={{ flex: 1 }}>
              <HeatmapChart data={data.heatmap || []} />
           </div>
        </div>

        <div className="ui-card">
           <div className="ui-card-glow"></div>
           <div className={styles.chartHeaderInner}>
              <h3 className="ui-monitor-name">Source Efficiency</h3>
              <p className="ui-dashboard-subtitle">Performance ranking.</p>
           </div>
           <div className={styles.chartContentInner} style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.platforms || []}>
                   <XAxis dataKey="displayName" hide />
                   <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                   <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {(data.platforms || []).map((entry: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={ANALYTICS_PIE_COLORS[index % ANALYTICS_PIE_COLORS.length]} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="loading-container"><div className="loader"></div></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
