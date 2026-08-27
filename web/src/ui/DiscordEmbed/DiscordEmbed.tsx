import React, { useRef, useEffect, memo } from 'react';
import type { DiscordEmbedProps } from './types';
import { EmbedAuthor } from './DiscordEmbedAuthor';
import { DiscordEmbedFields } from './DiscordEmbedFields';
import { EmbedFooter } from './DiscordEmbedFooter';
import styles from './DiscordEmbed.module.css';

export * from './types';
export * from './DiscordEmbedAuthor';
export * from './DiscordEmbedFields';
export * from './DiscordEmbedFooter';

const DiscordEmbedComponent: React.FC<DiscordEmbedProps> = ({
  channelName = 'feed-alerts',
  botName = 'Nova',
  avatarUrl = '/images/logo.webp',
  timestamp = 'Today at 2:10 AM',
  author,
  title,
  titleUrl = '#',
  description,
  fields,
  thumbnail,
  image,
  footer,
  footerText = 'Delivered by Nova Feeds • Sub-second Latency',
  accentColor,
  components,
  children,
  className = '',
  id,
  ...rest
}) => {
  const embedBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedBoxRef.current) {
      if (accentColor) {
        embedBoxRef.current.style.borderLeftColor = accentColor;
      } else {
        embedBoxRef.current.style.removeProperty('border-left-color');
      }
    }
  }, [accentColor]);

  return (
    <div id={id} className={`${styles.preview} ${className}`} {...rest}>
      <div className={styles.header}>
        <span>#</span>
        <span>{channelName}</span>
      </div>

      <div className={styles.body}>
        <img
          src={avatarUrl}
          alt={botName}
          className={styles.avatar}
          loading="lazy"
          decoding="async"
          width="40"
          height="40"
        />

        <div className={styles.content}>
          <div className={styles.author}>
            <span className={styles.botName}>{botName}</span>
            <span className={styles.badge}>APP</span>
            <span className={styles.timestamp}>{timestamp}</span>
          </div>

          <div ref={embedBoxRef} className={styles.embedBox}>
            <div className={styles.embedHeaderLayout}>
              <div className={styles.embedMain}>
                <EmbedAuthor author={author} />

                <a href={titleUrl} className={styles.title} target="_blank" rel="noreferrer">
                  {title}
                </a>

                <p className={styles.desc}>{description}</p>
              </div>

              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Embed thumbnail"
                  className={styles.thumbnail}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>

            <DiscordEmbedFields fields={fields} />

            {image && (
              <img
                src={image}
                alt="Embed banner"
                className={styles.image}
                loading="lazy"
                decoding="async"
              />
            )}

            {children}

            <EmbedFooter footer={footer} footerText={footerText} />
          </div>

          {components && <div className={styles.componentsContainer}>{components}</div>}
        </div>
      </div>
    </div>
  );
};

export const DiscordEmbed = memo(DiscordEmbedComponent);
