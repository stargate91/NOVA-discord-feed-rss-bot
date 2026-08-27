import React from 'react';
import { useTranslation } from '@/i18n';
import { Card, DiscordEmbed } from '@/ui';
import type { FeedFormState } from '../types';

interface FeedEmbedPreviewProps {
  guildId: string;
  formState: FeedFormState;
}

export const FeedEmbedPreview: React.FC<FeedEmbedPreviewProps> = ({ guildId, formState }) => {
  const { t } = useTranslation();
  const { platform, destChannel, pingRole, debouncedTargetId } = formState;

  return (
    <Card
      glow="purple"
      padding="xl"
      title={t('guild.liveEmbedPreviewTitle')}
      subtitle={t('guild.liveEmbedPreviewSubtitle')}
    >
      <DiscordEmbed
        channelName={destChannel || t('guild.defaultFeedAlertsChannel')}
        botName={t('common.brandName')}
        avatarUrl="/images/logo.webp"
        timestamp={t('guild.embedTimestampJustNow')}
        author={{
          name: `${debouncedTargetId || t('guild.embedChannelFallback')} • Live Feed`,
          icon_url: '/images/logo.webp',
        }}
        title={t('guild.embedPublishedContent', {
          target: debouncedTargetId || t('guild.embedFeedTargetFallback'),
        })}
        description={t('guild.embedProcessedBy', { type: platform.toUpperCase() })}
        thumbnail="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60"
        fields={[
          {
            name: t('guild.embedFieldTargetAccount'),
            value: `@${debouncedTargetId || t('guild.embedCreatorFallback')}`,
            inline: true,
          },
          {
            name: t('guild.embedFieldTargetChannel'),
            value: `#${destChannel || t('guild.defaultFeedAlertsChannel')}`,
            inline: true,
          },
          {
            name: t('guild.embedFieldPingTarget'),
            value: pingRole ? `@${pingRole}` : t('guild.embedPingNone'),
            inline: true,
          },
        ]}
        footer={{
          text: t('guild.embedFooterText', { guildId }),
          timestamp: t('guild.embedFooterTimestamp'),
        }}
      />
    </Card>
  );
};
