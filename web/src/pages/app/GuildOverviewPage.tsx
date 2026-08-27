import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, Activity, Zap, CheckCircle2, Sliders, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '../../i18n';
import {
  Card,
  Button,
  Badge,
  ProgressBar,
  Chip,
  Stack,
  Inline,
  Grid,
  Text,
} from '../../ui';

const OVERVIEW_PLATFORMS = [
  { id: 'youtube', labelKey: 'guild.feedPlatformYoutube', icon: '/images/brands/youtube.png', selected: true },
  { id: 'twitch', labelKey: 'guild.feedPlatformTwitch', icon: '/images/brands/twitch.png', selected: true },
  { id: 'steam', labelKey: 'guild.feedPlatformSteamDeals', icon: '/images/brands/steam.png', selected: true },
  { id: 'kick', labelKey: 'guild.feedPlatformKickLive', icon: '/images/brands/kick.png', selected: false },
] as const;

export const GuildOverviewPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Stack gap="xl">
      <Inline justify="between" align="center" wrap gap="md">
        <Stack gap="3xs">
          <Text as="h2" size="lg" weight="bold">
            {t('guild.overviewTitle')}
          </Text>
          <Text size="xs" color="secondary">
            {t('guild.overviewSubtitle', { guildId })}
          </Text>
        </Stack>

        <Inline gap="xs" wrap>
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
        </Inline>
      </Inline>

      {/* Metrics Row with Cards and Progress */}
      <Grid minItemWidth="sm" gap="lg">
        <Card glow="blue">
          <Card.Header>
            <Card.Title>{t('guild.metricActiveFeeds')}</Card.Title>
            <Card.Actions>
              <Activity size={16} color="var(--blue-400)" />
            </Card.Actions>
          </Card.Header>
          <Stack gap="xs">
            <Text size="2xl" weight="black" color="brand">
              {t('guild.metricActiveFeedsQuota', { current: 8, max: 25 })}
            </Text>
            <Text size="2xs" color="muted">
              {t('guild.metricActiveFeedsDesc', { percent: 32 })}
            </Text>
            <ProgressBar value={32} max={100} size="sm" variant="brand" />
          </Stack>
        </Card>

        <Card glow="green">
          <Card.Header>
            <Card.Title>{t('guild.metricLatency')}</Card.Title>
            <Card.Actions>
              <Zap size={16} color="var(--status-success)" />
            </Card.Actions>
          </Card.Header>
          <Stack gap="xs">
            <Text size="2xl" weight="black" color="success">
              {t('guild.metricLatencyValue', { ms: 142 })}
            </Text>
            <Text size="2xs" color="muted">
              {t('guild.metricLatencyDesc')}
            </Text>
            <ProgressBar value={94} max={100} size="sm" variant="success" />
          </Stack>
        </Card>

        <Card glow="purple">
          <Card.Header>
            <Card.Title>{t('guild.metricDelivered')}</Card.Title>
            <Card.Actions>
              <CheckCircle2 size={16} color="var(--status-purple)" />
            </Card.Actions>
          </Card.Header>
          <Stack gap="xs">
            <Text size="2xl" weight="black" color="purple">
              {t('guild.metricDeliveredValue', { count: 64 })}
            </Text>
            <Text size="2xs" color="muted">
              {t('guild.metricDeliveredDesc')}
            </Text>
            <ProgressBar value={64} max={100} size="sm" variant="purple" />
          </Stack>
        </Card>
      </Grid>

      {/* Quick Access Grid */}
      <Grid minItemWidth="md" gap="lg">
        <Card title={t('guild.monitoredPlatformsTitle')} subtitle={t('guild.monitoredPlatformsSubtitle')}>
          <Stack gap="md">
            <Inline gap="xs" wrap>
              {OVERVIEW_PLATFORMS.map((platform) => (
                <Chip
                  key={platform.id}
                  label={t(platform.labelKey)}
                  icon={platform.icon}
                  selected={platform.selected}
                />
              ))}
            </Inline>
            <Text size="xs" color="secondary">
              {t('guild.monitoredPlatformsDesc')}
            </Text>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/dashboard/${guildId}/feeds`)}
            >
              <Sliders size={14} /> {t('guild.configureChannelsBtn')}
            </Button>
          </Stack>
        </Card>

        <Card title={t('guild.planDetailsTitle')} subtitle={t('guild.planDetailsSubtitle')}>
          <Stack gap="md">
            <Stack gap="xs">
              <Inline justify="between" align="center">
                <Text size="xs" color="secondary">{t('guild.activeTierLabel')}</Text>
                <Badge variant="online" dot pulse>{t('guild.activeTierValue')}</Badge>
              </Inline>
              <Inline justify="between" align="center">
                <Text size="xs" color="secondary">{t('guild.refreshIntervalLabel')}</Text>
                <Text size="xs" weight="semibold">
                  {t('guild.refreshIntervalValue', { seconds: 120 })}
                </Text>
              </Inline>
              <Inline justify="between" align="center">
                <Text size="xs" color="secondary">{t('guild.promoCodeLabel')}</Text>
                <Badge variant="tier">{t('guild.promoCodeApplied')}</Badge>
              </Inline>
            </Stack>

            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/dashboard/${guildId}/premium`)}
            >
              <ArrowUpRight size={14} /> {t('guild.upgradePlanBtn')}
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
};

