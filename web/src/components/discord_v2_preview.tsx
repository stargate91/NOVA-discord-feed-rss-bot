"use client";

import React from 'react';
import { DiscordEmbedPreview } from './discord_embed_preview';

export default function DiscordV2Preview() {
  return (
    <DiscordEmbedPreview
      botName="Nova"
      botAvatar="/nova_v2.jpg"
      channelName="neural-transmission"
      authorName="Nova Cybernetics"
      platformIcon="https://cdn.discordapp.com/emojis/1495845103447576807.png"
      title="Project Awakening: First Neural Sync with a Class-4 Android"
      embedColor="var(--status-error)"
      mediaImage="/nova_thumbnail.jpg"
      publishedAt={new Date()}
      buttonText="View on YouTube"
      footerText="Nova"
      enableScanline
    />
  );
}
