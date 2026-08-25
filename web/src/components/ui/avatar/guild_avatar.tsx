"use client";

import React from 'react';
import { Avatar, AvatarProps, AvatarSize, AvatarShape } from './avatar';
import { getGuildIconUrl, getGuildInitials } from '@/utils';

export interface GuildAvatarProps extends Omit<AvatarProps, 'src' | 'fallback'> {
  guild?: {
    id: string;
    name: string;
    icon?: string | null;
    hasBot?: boolean;
    bot_in_guild?: boolean;
    [key: string]: any;
  } | null;
  size?: AvatarSize;
  shape?: AvatarShape;
  iconSize?: number;
  fallback?: React.ReactNode;
}

export function GuildAvatar({
  guild,
  size = 'md',
  shape = 'circle',
  iconSize = 128,
  status,
  fallback,
  className,
  ...props
}: GuildAvatarProps) {
  if (!guild) {
    return (
      <Avatar
        size={size}
        shape={shape}
        fallback={fallback || '?'}
        className={className}
        {...props}
      />
    );
  }

  const iconUrl = getGuildIconUrl(guild.id, guild.icon ?? null, iconSize);
  const initials = fallback || getGuildInitials(guild.name, 1);
  const effectiveStatus = status !== undefined
    ? status
    : (guild.hasBot || guild.bot_in_guild ? 'online' : undefined);

  return (
    <Avatar
      src={iconUrl}
      alt={guild.name}
      size={size}
      shape={shape}
      fallback={initials}
      status={effectiveStatus}
      className={className}
      {...props}
    />
  );
}

export default GuildAvatar;
