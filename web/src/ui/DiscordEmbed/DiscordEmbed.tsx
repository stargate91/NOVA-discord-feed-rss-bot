import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './DiscordEmbed.module.css';

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
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const DiscordEmbed: React.FC<DiscordEmbedProps> = ({
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
  children,
  className = '',
  id,
  ...rest
}) => {
  const footerContent = footer ?? { text: footerText };

  return (
    <div id={id} className={`${styles.preview} ${className}`} {...rest}>
      <div className={styles.header}>
        <span>#</span>
        <span>{channelName}</span>
      </div>

      <div className={styles.body}>
        <img src={avatarUrl} alt={botName} className={styles.avatar} />

        <div className={styles.content}>
          <div className={styles.author}>
            <span className={styles.botName}>{botName}</span>
            <span className={styles.badge}>APP</span>
            <span className={styles.timestamp}>{timestamp}</span>
          </div>

          <div className={styles.embedBox}>
            <div className={styles.embedHeaderLayout}>
              <div className={styles.embedMain}>
                {author && (
                  <a
                    href={author.url || '#'}
                    className={styles.embedAuthor}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {author.icon_url && (
                      <img src={author.icon_url} alt={author.name} className={styles.embedAuthorIcon} />
                    )}
                    <span>{author.name}</span>
                  </a>
                )}

                <a href={titleUrl} className={styles.title} target="_blank" rel="noreferrer">
                  {title}
                </a>

                <p className={styles.desc}>{description}</p>
              </div>

              {thumbnail && <img src={thumbnail} alt="Embed thumbnail" className={styles.thumbnail} />}
            </div>

            {fields && fields.length > 0 && (
              <div className={styles.fieldsGrid}>
                {fields.map((field) => (
                  <div
                    key={`${field.name}-${field.value}`}
                    className={`${styles.field} ${field.inline ? '' : styles.fieldFull}`}
                  >
                    <div className={styles.fieldName}>{field.name}</div>
                    <div className={styles.fieldValue}>{field.value}</div>
                  </div>
                ))}
              </div>
            )}

            {image && <img src={image} alt="Embed banner" className={styles.image} />}

            {children}

            {footerContent.text && (
              <div className={styles.footer}>
                {footerContent.icon_url && (
                  <img src={footerContent.icon_url} alt="Footer icon" className={styles.footerIcon} />
                )}
                <span>
                  {footerContent.text}
                  {footerContent.timestamp ? ` • ${footerContent.timestamp}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
