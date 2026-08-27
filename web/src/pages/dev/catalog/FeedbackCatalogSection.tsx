/* eslint-disable i18next/no-literal-string, react/forbid-component-props */
import React from 'react';
import { Card, Stack, Inline, Text, Badge, Chip, Tag, ProgressBar, Skeleton, DiscordEmbed, Divider } from '@/ui';

export const FeedbackCatalogSection: React.FC = () => {
  return (
    <Stack gap="xl">
      <Card padding="lg">
        <Stack gap="md">
          <Text as="h2" size="lg" weight="bold">
            Badges, Chips, Tags & Discord Previews
          </Text>
          <Divider />

          <Text size="xs" weight="bold" color="secondary">
            BADGES & CHIPS
          </Text>
          <Inline gap="xs" wrap>
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="danger">Error</Badge>
            <Badge variant="purple">Pro Tier</Badge>
            <Chip label="YouTube RSS" variant="filled" active />
            <Chip label="Twitch Live" variant="outline" />
            <Chip label="Kick VOD" variant="subtle" />
            <Tag variant="default" color="blue">
              #discord-feeds
            </Tag>
          </Inline>

          <Text size="xs" weight="bold" color="secondary">
            PROGRESS & SKELETON LOADERS
          </Text>
          <ProgressBar value={72} max={100} variant="brand" label="Database Cache Load" />
          <Inline gap="md" align="center">
            <Skeleton variant="circular" width="quarter" height="md" />
            <Stack gap="xs" style={{ flex: 1 }}>
              <Skeleton width="two-thirds" height="xs" />
              <Skeleton width="half" height="xs" />
            </Stack>
          </Inline>

          <Text size="xs" weight="bold" color="secondary">
            DISCORD EMBED PREVIEW
          </Text>
          <DiscordEmbed
            author={{ name: 'Nova Feeds Bot', icon_url: '/images/logo.webp' }}
            title="🚀 Version 2.4 Released with Webhook Automation"
            description="Instant multi-platform notifications with zero latency delivery and customizable rich embed layouts."
            color="#5865F2"
            timestamp="Today at 15:20"
            footer={{ text: 'Nova Delivery Network • EU-Central' }}
          />
        </Stack>
      </Card>
    </Stack>
  );
};
