import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useDebounce } from '../../hooks';
import { useToast } from '../../components/common/Toast';
import { useConfirm } from '../../components/common/Modal';
import { Card, Button, Input, Select, Chip, DiscordEmbed } from '../../ui';
import styles from './AppPages.module.css';

export const GuildFeedsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [selectedType, setSelectedType] = useState<string>('youtube');
  const [targetId, setTargetId] = useState<string>('MrBeast');
  const [destChannel, setDestChannel] = useState<string>('123456789');
  const [pingRole, setPingRole] = useState<string>('');

  // Debounce the target input for smooth preview rendering without re-triggering heavy operations
  const debouncedTargetId = useDebounce(targetId, 250);

  const handleTestFeed = () => {
    toast.success(`Simulated delivery payload dispatched for ${selectedType.toUpperCase()} -> #${destChannel}`, 'Feed Test Sent');
  };

  const handleSaveFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim() || !destChannel.trim()) {
      toast.warning('Please enter a target username/channel and destination channel ID.', 'Validation Warning');
      return;
    }
    toast.success(`Monitor for ${targetId} (${selectedType}) activated successfully!`, 'Monitor Saved');
  };

  const handleClearForm = async () => {
    const isConfirmed = await confirm({
      title: 'Reset Monitor Form',
      message: 'Are you sure you want to discard your unsaved feed configuration parameters?',
      variant: 'warning',
      confirmText: 'Reset Form',
      cancelText: 'Keep Editing',
    });

    if (isConfirmed) {
      setTargetId('');
      setDestChannel('');
      setPingRole('');
      toast.info('Feed configuration form has been cleared.', 'Form Cleared');
    }
  };

  return (
    <div>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>{t('guild.feedsTitle')}</h2>
          <p className={styles.tabSubtitle}>
            {t('guild.feedsSubtitle', { guildId })}
          </p>
        </div>

        <div className={styles.actionRow}>
          <Button variant="secondary" onClick={handleClearForm}>
            <Trash2 size={14} /> Clear Form
          </Button>
          <Button variant="primary" onClick={handleTestFeed}>
            <Zap size={14} /> {t('guild.runTestBtn')}
          </Button>
        </div>
      </div>

      {/* Select Platform Type */}
      <div className={styles.platformGroup}>
        <p className={styles.platformLabel}>{t('guild.supportedIntegrations')}</p>
        <div className={styles.chipsWrapper}>
          <Chip label="YouTube" icon="/images/brands/youtube.png" selected={selectedType === 'youtube'} onClick={() => setSelectedType('youtube')} />
          <Chip label="Twitch" icon="/images/brands/twitch.png" selected={selectedType === 'twitch'} onClick={() => setSelectedType('twitch')} />
          <Chip label="Kick" icon="/images/brands/kick.png" selected={selectedType === 'kick'} onClick={() => setSelectedType('kick')} />
          <Chip label="Epic Games" icon="/images/brands/epic_games.png" selected={selectedType === 'epic_games'} onClick={() => setSelectedType('epic_games')} />
          <Chip label="Steam" icon="/images/brands/steam.png" selected={selectedType === 'steam'} onClick={() => setSelectedType('steam')} />
          <Chip label="TMDB" icon="/images/brands/tmdb.png" selected={selectedType === 'tmdb'} onClick={() => setSelectedType('tmdb')} />
          <Chip label="RSS" icon="/images/brands/rss.png" selected={selectedType === 'rss'} onClick={() => setSelectedType('rss')} />
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Create Feed Card */}
        <Card title={t('guild.addMonitorTitle')} subtitle={t('guild.selectedTypeSubtitle', { type: selectedType.toUpperCase() })}>
          <form className={styles.formStack} onSubmit={handleSaveFeed}>
            <Select
              label={t('guild.typeLabel')}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: 'youtube', label: 'YouTube Video Uploads' },
                { value: 'twitch', label: 'Twitch Livestreams' },
                { value: 'kick', label: 'Kick Streams' },
                { value: 'epic_games', label: 'Epic Games Free Giveaways' },
                { value: 'steam', label: 'Steam 100% Off Deals' },
                { value: 'tmdb', label: 'TMDB Popular Movies' },
                { value: 'rss', label: 'Custom RSS/Atom Feed' },
              ]}
            />

            <Input
              label={t('guild.targetIdLabel')}
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder={t('guild.targetIdPlaceholder')}
            />

            <Input
              label={t('guild.destChannelLabel')}
              value={destChannel}
              onChange={(e) => setDestChannel(e.target.value)}
              placeholder={t('guild.destChannelPlaceholder')}
            />

            <Input
              label={t('guild.pingRoleLabel')}
              value={pingRole}
              onChange={(e) => setPingRole(e.target.value)}
              placeholder={t('guild.pingRolePlaceholder')}
            />

            <Button type="submit" variant="primary" fullWidth>
              {t('guild.saveMonitorBtn')}
            </Button>
          </form>
        </Card>

        {/* Live Discord Embed Simulation */}
        <Card title={t('guild.liveEmbedPreviewTitle')} subtitle={t('guild.liveEmbedPreviewSubtitle')}>
          <DiscordEmbed
            botName="Nova"
            avatarUrl="/images/logo.webp"
            timestamp="Just now"
            title={`${debouncedTargetId || 'Feed Target'} new content dropped!`}
            description={`Automated notification delivery processed by Nova for **${selectedType.toUpperCase()}**.`}
            footerText={`Nova Feeds • Guild ${guildId}`}
          />
        </Card>
      </div>
    </div>
  );
};
