"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '@/utils/date';
import styles from './discord_embed_preview.module.css';

export interface DiscordEmbedPreviewProps {
  botName?: string;
  botAvatar?: string;
  channelName?: string;
  authorName?: string;
  platformIcon?: string;
  title?: string;
  description?: string;
  embedColor?: string;
  mediaImage?: string;
  publishedAt?: string | Date;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
  enableScanline?: boolean;
  className?: string;
}

export function DiscordEmbedPreview({
  botName = 'Nova',
  botAvatar = '/nova_v2.jpg',
  channelName = 'neural-transmission',
  authorName = 'Nova Cybernetics',
  platformIcon = 'https://cdn.discordapp.com/emojis/1495845103447576807.png',
  title = 'Project Awakening: First Neural Sync with a Class-4 Android',
  description,
  embedColor = '#ff0000',
  mediaImage = '/nova_thumbnail.jpg',
  publishedAt = new Date(),
  buttonText = 'View on YouTube',
  buttonUrl,
  footerText = 'Nova',
  enableScanline = false,
  className,
}: DiscordEmbedPreviewProps) {
  const [avatarSrc, setAvatarSrc] = useState(botAvatar);
  const handleAvatarError = () => setAvatarSrc('https://cdn.discordapp.com/embed/avatars/0.png');

  const relativeTime = formatRelativeTime(publishedAt);

  return (
    <div className={[styles['discord-wrapper'], className].filter(Boolean).join(' ')}>
      <div className={styles['discord-container']}>
        {/* Discord Header Mockup */}
        <div className={styles['discord-header']}>
          <span className={styles['channel-hash']}>#</span>
          <span className={styles['channel-name']}>{channelName}</span>
        </div>

        {enableScanline && <div className={styles.scanline} />}

        {/* Message Content */}
        <div className={styles['discord-message']}>
          <div className={styles['avatar-wrap']}>
            <Image
              src={avatarSrc}
              alt={botName}
              width={44}
              height={44}
              unoptimized
              onError={handleAvatarError}
            />
          </div>

          <div className={styles['message-body']}>
            <div className={styles['meta-row']}>
              <span className={styles['bot-name']}>{botName}</span>
              <span className={styles['badge-app']}>APP</span>
              <span className={styles.timestamp}>Today at 1:47 PM</span>
            </div>

            {/* The Rich Embed */}
            <div className={styles['embed-container']}>
              <div
                className={styles['embed-stripe']}
                // eslint-disable-next-line react/forbid-dom-props
                style={{ backgroundColor: embedColor || 'var(--status-error)' }}
              />
              <div className={styles['embed-content']}>
                {/* Header with Platform Icon and Title */}
                {(platformIcon || title) && (
                  <div className={styles['embed-header']}>
                    {platformIcon && (
                      <Image
                        src={platformIcon}
                        width={24}
                        height={18}
                        unoptimized
                        alt=""
                      />
                    )}
                    {title && <span className={styles['embed-title']}>{title}</span>}
                  </div>
                )}

                {/* Optional Embed Description (e.g. for custom alert templates) */}
                {description && (
                  <div className={styles['embed-description']}>{description}</div>
                )}

                {/* Large Main Image */}
                {mediaImage && (
                  <div className={styles['media-wrap']}>
                    <Image
                      src={mediaImage}
                      alt="Thumbnail"
                      width={600}
                      height={338}
                      unoptimized
                      className={styles['media-image']}
                    />
                  </div>
                )}

                {/* Info & Button Row */}
                <div className={styles['footer-row']}>
                  <div className={styles['channel-meta']}>
                    {authorName && <div className={styles['author-title']}>{authorName}</div>}
                    <div className={styles['published-label']}>Published:</div>
                    <div className={styles['published-pill']}>
                      April 27, 2026 02:10{' '}
                      {relativeTime && (
                        <span className={styles['published-relative']}>({relativeTime})</span>
                      )}
                    </div>
                  </div>
                  {buttonText && (
                    <div className={styles['btn-action-wrap']}>
                      <button
                        type="button"
                        className={styles['discord-btn']}
                        onClick={() => buttonUrl && window.open(buttonUrl, '_blank')}
                      >
                        <span>{buttonText}</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {footerText && (
                  <div className={styles['delivered-by']}>
                    Delivered by <span className={styles['delivered-highlight']}>{footerText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscordEmbedPreview;
