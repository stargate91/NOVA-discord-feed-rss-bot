import React from 'react';
import type { DiscordEmbedAuthor as DiscordEmbedAuthorData } from './types';
import styles from './DiscordEmbed.module.css';

export interface EmbedAuthorProps {
  author?: DiscordEmbedAuthorData;
}

export const EmbedAuthor: React.FC<EmbedAuthorProps> = ({ author }) => {
  if (!author) return null;

  return (
    <a href={author.url || '#'} className={styles.embedAuthor} target="_blank" rel="noreferrer">
      {author.icon_url && (
        <img
          src={author.icon_url}
          alt={author.name}
          className={styles.embedAuthorIcon}
          loading="lazy"
          decoding="async"
          width="24"
          height="24"
        />
      )}
      <span>{author.name}</span>
    </a>
  );
};
