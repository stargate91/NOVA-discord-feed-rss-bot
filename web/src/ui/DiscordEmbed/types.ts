import type { HTMLAttributes, ReactNode } from 'react';

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedAuthor {
  name: string;
  icon_url?: string;
  url?: string;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  timestamp?: string;
}

export interface DiscordEmbedProps extends HTMLAttributes<HTMLDivElement> {
  channelName?: string;
  botName?: string;
  avatarUrl?: string;
  timestamp?: string;
  author?: DiscordEmbedAuthor;
  title: string;
  titleUrl?: string;
  description: string;
  fields?: DiscordEmbedField[];
  thumbnail?: string;
  image?: string;
  footer?: DiscordEmbedFooter;
  footerText?: string;
  accentColor?: string;
  components?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}
