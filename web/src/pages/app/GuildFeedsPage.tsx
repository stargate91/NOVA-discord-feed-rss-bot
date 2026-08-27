import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Rss, Hash, AtSign, Zap, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useToast } from '../../components/common/Toast';
import {
  Card,
  Button,
  Input,
  Select,
  Chip,
  DiscordEmbed,
  Field,
  Stack,
  Inline,
  Grid,
  Text,
} from '../../ui';

const PLATFORMS = [
  { id: 'youtube', icon: '/images/brands/youtube.png', labelKey: 'guild.feedPlatformYoutube' },
  { id: 'twitch', icon: '/images/brands/twitch.png', labelKey: 'guild.feedPlatformTwitch' },
  { id: 'kick', icon: '/images/brands/kick.png', labelKey: 'guild.feedPlatformKick' },
  { id: 'epic_games', icon: '/images/brands/epic_games.png', labelKey: 'guild.feedPlatformEpicGames' },
  { id: 'steam', icon: '/images/brands/steam.png', labelKey: 'guild.feedPlatformSteam' },
  { id: 'tmdb', icon: '/images/brands/tmdb.png', labelKey: 'guild.feedPlatformTmdb' },
  { id: 'rss', icon: '/images/brands/rss.png', labelKey: 'guild.feedPlatformRss' },
] as const;

const FEED_TYPE_OPTIONS = [
  { value: 'youtube', labelKey: 'guild.feedTypeYoutubeLabel', descKey: 'guild.feedTypeYoutubeDesc' },
  { value: 'twitch', labelKey: 'guild.feedTypeTwitchLabel', descKey: 'guild.feedTypeTwitchDesc' },
  { value: 'kick', labelKey: 'guild.feedTypeKickLabel', descKey: 'guild.feedTypeKickDesc' },
  { value: 'epic_games', labelKey: 'guild.feedTypeEpicGamesLabel', descKey: 'guild.feedTypeEpicGamesDesc' },
  { value: 'steam', labelKey: 'guild.feedTypeSteamLabel', descKey: 'guild.feedTypeSteamDesc' },
  { value: 'tmdb', labelKey: 'guild.feedTypeTmdbLabel', descKey: 'guild.feedTypeTmdbDesc' },
  { value: 'rss', labelKey: 'guild.feedTypeRssLabel', descKey: 'guild.feedTypeRssDesc' },
] as const;

export const GuildFeedsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const toast = useToast();

  const [selectedType, setSelectedType] = useState<string>('youtube');
  const [targetId, setTargetId] = useState<string>('');
  const [destChannel, setDestChannel] = useState<string>('feed-alerts');
  const [pingRole, setPingRole] = useState<string>('');

  // Embed reactive debounce simulation
  const [debouncedTargetId, setDebouncedTargetId] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTargetId(targetId);
    }, 200);
    return () => clearTimeout(timer);
  }, [targetId]);

  const handleSaveFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) {
      toast.warning('Please enter a target username/channel and destination channel ID.', 'Validation Warning');
      return;
    }
    toast.success(`Monitor for ${targetId} (${selectedType}) activated successfully!`, 'Monitor Saved');
  };

  const handleTestFeed = () => {
    toast.success(`Simulated delivery payload dispatched for ${selectedType.toUpperCase()} -> #${destChannel}`, 'Feed Test Sent');
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear this monitor setup?')) {
      setTargetId('');
      setDestChannel('feed-alerts');
      setPingRole('');
      toast.info('Feed configuration form has been cleared.', 'Form Cleared');
    }
  };

  return (
    <Stack gap="xl">
      <Inline justify="between" align="center" wrap gap="md">
        <Stack gap="3xs">
          <Text as="h2" size="lg" weight="bold">
            {t('guild.feedsTitle')}
          </Text>
          <Text size="xs" color="secondary">
            {t('guild.feedsSubtitle', { guildId })}
          </Text>
        </Stack>

        <Inline gap="xs" wrap>
          <Button variant="secondary" onClick={handleClearForm}>
            <Trash2 size={14} /> {t('guild.clearFormBtn')}
          </Button>
          <Button variant="primary" onClick={handleTestFeed}>
            <Zap size={14} /> {t('guild.runTestBtn')}
          </Button>
        </Inline>
      </Inline>

      {/* Select Platform Type */}
      <Stack gap="xs">
        <Text size="xs" color="secondary">{t('guild.supportedIntegrations')}</Text>
        <Inline gap="xs" wrap>
          {PLATFORMS.map((platform) => (
            <Chip
              key={platform.id}
              label={t(platform.labelKey)}
              icon={platform.icon}
              selected={selectedType === platform.id}
              onClick={() => setSelectedType(platform.id)}
            />
          ))}
        </Inline>
      </Stack>

      <Grid minItemWidth="md" gap="lg">
        {/* Create Feed Card */}
        <Card glow="blue" padding="xl" title={t('guild.addMonitorTitle')} subtitle={t('guild.selectedTypeSubtitle', { type: selectedType.toUpperCase() })}>
          <form onSubmit={handleSaveFeed}>
            <Stack gap="md">
              <Field label={t('guild.typeLabel')} required>
                <Select
                  leftIcon={<Rss size={15} />}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  options={FEED_TYPE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(opt.labelKey),
                    description: t(opt.descKey),
                  }))}
                />
              </Field>

              <Field label={t('guild.targetIdLabel')} required hint={t('guild.targetIdHint')}>
                <Input
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder={t('guild.targetIdPlaceholder')}
                  clearable
                />
              </Field>

              <Field label={t('guild.destChannelLabel')} required hint={t('guild.destChannelHint')}>
                <Input
                  leftIcon={<Hash size={15} />}
                  value={destChannel}
                  onChange={(e) => setDestChannel(e.target.value)}
                  placeholder={t('guild.destChannelPlaceholder')}
                  clearable
                />
              </Field>

              <Field label={t('guild.pingRoleLabel')} optional hint={t('guild.pingRoleHint')}>
                <Input
                  leftIcon={<AtSign size={15} />}
                  value={pingRole}
                  onChange={(e) => setPingRole(e.target.value)}
                  placeholder={t('guild.pingRolePlaceholder')}
                  clearable
                />
              </Field>

              <Button type="submit" variant="primary" fullWidth size="lg">
                {t('guild.saveMonitorBtn')}
              </Button>
            </Stack>
          </form>
        </Card>

        {/* Live Discord Embed Simulation */}
        <Card glow="purple" padding="xl" title={t('guild.liveEmbedPreviewTitle')} subtitle={t('guild.liveEmbedPreviewSubtitle')}>
          <DiscordEmbed
            channelName={destChannel || t('guild.defaultFeedAlertsChannel')}
            botName={t('common.brandName')}
            avatarUrl="/images/logo.webp"
            timestamp={t('guild.embedTimestampJustNow')}
            author={{
              name: `${debouncedTargetId || t('guild.embedChannelFallback')} • Live Feed`,
              icon_url: '/images/logo.webp',
            }}
            title={t('guild.embedPublishedContent', { target: debouncedTargetId || t('guild.embedFeedTargetFallback') })}
            description={t('guild.embedProcessedBy', { type: selectedType.toUpperCase() })}
            thumbnail="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60"
            fields={[
              { name: t('guild.embedFieldTargetAccount'), value: `@${debouncedTargetId || t('guild.embedCreatorFallback')}`, inline: true },
              { name: t('guild.embedFieldTargetChannel'), value: `#${destChannel || t('guild.defaultFeedAlertsChannel')}`, inline: true },
              { name: t('guild.embedFieldPingTarget'), value: pingRole ? `@${pingRole}` : t('guild.embedPingNone'), inline: true },
            ]}
            footer={{
              text: t('guild.embedFooterText', { guildId }),
              timestamp: t('guild.embedFooterTimestamp'),
            }}
          />
        </Card>
      </Grid>
    </Stack>
  );
};
