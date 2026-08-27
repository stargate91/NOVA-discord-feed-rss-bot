import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { FeatureGate } from '../../components/common/FeatureGate';
import { Card, Badge } from '../../ui';
import styles from './AppPages.module.css';

export const GuildAnalyticsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();

  return (
    <div>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>{t('guild.analyticsTitle')}</h2>
          <p className={styles.tabSubtitle}>
            {t('guild.analyticsSubtitle', { guildId })}
          </p>
        </div>

        <Badge variant="online" dot>{t('guild.liveMetricsBadge')}</Badge>
      </div>

      {/* Primary Counters */}
      <div className={styles.grid3}>
        <Card title={t('guild.totalPostsDelivered')}>
          <div className={styles.metricValue}>1,428</div>
          <div className={styles.metricDesc}>Across all channels since bot join</div>
        </Card>

        <Card title={t('guild.successRate')}>
          <div className={styles.metricValue}>99.98%</div>
          <div className={styles.metricDesc}>0 failed requests in last 7 days</div>
        </Card>

        <Card title={t('guild.avgLatency')}>
          <div className={styles.metricValue}>118 ms</div>
          <div className={styles.metricDesc}>Time from platform release to Discord post</div>
        </Card>
      </div>

      {/* Secondary Detailed Breakdown */}
      <div className={`${styles.grid2} ${styles.sectionSpacing}`}>
        <Card title={t('guild.platformDistributionTitle')} subtitle={t('guild.platformDistributionSubtitle')}>
          <div className={styles.statRow}>
            <span>YouTube Videos</span>
            <span className={styles.statValue}>682 posts (48%)</span>
          </div>
          <div className={styles.statRow}>
            <span>Twitch & Kick Streams</span>
            <span className={styles.statValue}>430 posts (30%)</span>
          </div>
          <div className={styles.statRow}>
            <span>Free Game Giveaways</span>
            <span className={styles.statValue}>194 posts (14%)</span>
          </div>
          <div className={styles.statRow}>
            <span>Custom RSS Feeds</span>
            <span className={styles.statValue}>122 posts (8%)</span>
          </div>
        </Card>

        <Card title={t('guild.channelHealthTitle')} subtitle={t('guild.channelHealthSubtitle')}>
          <div className={styles.statRow}>
            <span>Active Destination Channels</span>
            <span className={styles.statValue}>4 Channels</span>
          </div>
          <div className={styles.statRow}>
            <span>Permission Errors</span>
            <span className={styles.statValue}>0 (Healthy)</span>
          </div>
          <div className={styles.statRow}>
            <span>Rate Limit Throttle Count</span>
            <span className={styles.statValue}>0 Events</span>
          </div>
          <div className={styles.statRow}>
            <span>Queue Ingestion Speed</span>
            <span className={styles.statValue}>1.4k events/sec</span>
          </div>
        </Card>
      </div>

      {/* Ultimate Tier Exclusive Real-time Stream Inspector */}
      <div className={styles.sectionSpacing}>
        <FeatureGate
          tier="ultimate"
          featureName="Historical 90-Day Analytics & Raw CSV Export"
          description="Access deep longitudinal trends, audience peak engagement heatmaps, and export raw delivery audit logs directly to CSV/JSON."
        >
          <Card title="Raw Audit Export & Longitudinal Metrics" subtitle="Ultimate & Master Tier Enterprise Exclusives">
            <p className={styles.feedDesc}>
              Full 90-day notification delivery archive is ready for export.
            </p>
          </Card>
        </FeatureGate>
      </div>
    </div>
  );
};
