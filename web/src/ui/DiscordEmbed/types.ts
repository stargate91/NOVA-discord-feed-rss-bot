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

export interface DiscordEmbedButton {
  label: string;
  url?: string;
  emoji?: string;
  variant?: 'primary' | 'secondary' | 'link';
}

export interface DiscordEmbedProps extends HTMLAttributes<HTMLDivElement> {
  channelName?: string;
  botName?: string;
  avatarUrl?: string;
  timestamp?: string;
  roleMention?: string;
  alertText?: string;
  alertUrl?: string;
  platformIcon?: string;
  author?: DiscordEmbedAuthor;
  title: string;
  titleUrl?: string;
  description?: string;
  metaLines?: string[];
  fields?: DiscordEmbedField[];
  thumbnail?: string;
  image?: string;
  accessoryButton?: DiscordEmbedButton;
  buttons?: DiscordEmbedButton[];
  footer?: DiscordEmbedFooter;
  footerText?: string;
  accentColor?: string;
  components?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}
