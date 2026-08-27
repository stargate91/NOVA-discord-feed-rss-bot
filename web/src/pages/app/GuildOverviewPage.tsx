import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Card, Button, Badge } from '../../ui';
import styles from './AppPages.module.css';

export const GuildOverviewPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>{t('guild.overviewTitle')}</h2>
          <p className={styles.tabSubtitle}>
            {t('guild.overviewSubtitle', { guildId })}
          </p>
        </div>

        <div className={styles.actionRow}>
          <Button
            variant="secondary"
            onClick={() => navigate('/servers')}
          >
            <ArrowLeftRight size={14} /> {t('guild.switchServerBtn')}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/dashboard/${guildId}/feeds`)}
          >
            <Plus size={14} /> {t('guild.manageFeedsBtn')}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.grid3}>
        <Card title={t('guild.metricActiveFeeds')}>
          <div className={styles.metricValue}>
            {t('guild.metricActiveFeedsQuota', { current: 8, max: 25 })}
          </div>
          <div className={styles.metricDesc}>
            {t('guild.metricActiveFeedsDesc', { percent: 32 })}
          </div>
        </Card>

        <Card title={t('guild.metricLatency')}>
          <div className={styles.metricValue}>
            {t('guild.metricLatencyValue', { ms: 142 })}
          </div>
          <div className={styles.metricDesc}>
            {t('guild.metricLatencyDesc')}
          </div>
        </Card>

        <Card title={t('guild.metricDelivered')}>
          <div className={styles.metricValue}>
            {t('guild.metricDeliveredValue', { count: 64 })}
          </div>
          <div className={styles.metricDesc}>
            {t('guild.metricDeliveredDesc')}
          </div>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className={`${styles.grid2} ${styles.sectionSpacing}`}>
        <Card title={t('guild.monitoredPlatformsTitle')} subtitle={t('guild.monitoredPlatformsSubtitle')}>
          <div className={styles.feedDesc}>
            {t('guild.monitoredPlatformsDesc')}
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/dashboard/${guildId}/feeds`)}
          >
            {t('guild.configureChannelsBtn')}
          </Button>
        </Card>

        <Card title={t('guild.planDetailsTitle')} subtitle={t('guild.planDetailsSubtitle')}>
          <div className={styles.statRow}>
            <span>{t('guild.activeTierLabel')}</span>
            <Badge variant="online">{t('guild.activeTierValue')}</Badge>
          </div>
          <div className={styles.statRow}>
            <span>{t('guild.refreshIntervalLabel')}</span>
            <span className={styles.statValue}>
              {t('guild.refreshIntervalValue', { seconds: 120 })}
            </span>
          </div>
          <div className={styles.statRow}>
            <span>{t('guild.promoCodeLabel')}</span>
            <Badge variant="tier">{t('guild.promoCodeApplied')}</Badge>
          </div>
          <div className={styles.btnContainer}>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/dashboard/${guildId}/premium`)}
            >
              {t('guild.upgradePlanBtn')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
