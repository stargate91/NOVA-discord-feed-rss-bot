"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import styles from './discord_v2_preview.module.css';

export default function DiscordV2Preview() {
  const [avatarSrc, setAvatarSrc] = useState('/nova_v2.jpg');

  return (
    <div className={styles['discord-wrapper']}>
      <div className={styles['discord-container']}>
        {/* Discord Header Mockup */}
        <div className={styles['discord-header']}>
          <span className={styles['channel-hash']}>#</span>
          <span className={styles['channel-name']}>neural-transmission</span>
        </div>

        <div className={styles.scanline} />

        {/* Message Content */}
        <div className={styles['discord-message']}>
          <div className={styles['avatar-wrap']}>
            <Image 
              src={avatarSrc} 
              alt="Nova" 
              width={44} 
              height={44} 
              unoptimized 
              onError={() => setAvatarSrc('https://cdn.discordapp.com/embed/avatars/0.png')}
            />
          </div>

          <div className={styles['message-body']}>
            <div className={styles['meta-row']}>
              <span className={styles['bot-name']}>Nova</span>
              <span className={styles['badge-app']}>APP</span>
              <span className={styles.timestamp}>Today at 1:47 PM</span>
            </div>

            {/* The Rich Embed */}
            <div className={styles['embed-container']}>
              <div className={styles['embed-stripe']} />
              <div className={styles['embed-content']}>
                {/* Header with YouTube Icon */}
                <div className={styles['embed-header']}>
                  <Image 
                    src="https://cdn.discordapp.com/emojis/1495845103447576807.png" 
                    width={24} 
                    height={18} 
                    unoptimized 
                    alt="YouTube" 
                  />
                  <span className={styles['embed-title']}>
                    Project Awakening: First Neural Sync with a Class-4 Android
                  </span>
                </div>

                {/* Large Main Image */}
                <div className={styles['media-wrap']}>
                  <Image 
                    src="/nova_thumbnail.jpg" 
                    alt="Video Thumbnail" 
                    width={600} 
                    height={338} 
                    unoptimized 
                    className={styles['media-image']}
                  />
                </div>

                {/* Info & Button Row */}
                <div className={styles['footer-row']}>
                  <div className={styles['channel-meta']}>
                    <div className={styles['author-title']}>Nova Cybernetics</div>
                    <div className={styles['published-label']}>Published:</div>
                    <div className={styles['published-pill']}>
                      April 27, 2026 02:10 <span className={styles['published-relative']}>(just now)</span>
                    </div>
                  </div>
                  <div className={styles['btn-action-wrap']}>
                    <button type="button" className={styles['discord-btn']}>
                      <span>View on YouTube</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles['delivered-by']}>
                  Delivered by <span className={styles['delivered-highlight']}>Nova</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
