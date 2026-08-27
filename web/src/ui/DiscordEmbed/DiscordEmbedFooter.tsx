import React from 'react';
import type { DiscordEmbedFooter as DiscordEmbedFooterData } from './types';
import styles from './DiscordEmbed.module.css';

export interface EmbedFooterProps {
  footer?: DiscordEmbedFooterData;
  footerText?: string;
}

export const EmbedFooter: React.FC<EmbedFooterProps> = ({
  footer,
  footerText = 'Delivered by Nova Feeds • Sub-second Latency',
}) => {
  const footerContent = footer ?? { text: footerText };

  if (!footerContent.text) return null;

  return (
    <div className={styles.footer}>
      {footerContent.icon_url && (
        <img
          src={footerContent.icon_url}
          alt="Footer icon"
          className={styles.footerIcon}
          loading="lazy"
          decoding="async"
          width="20"
          height="20"
        />
      )}
      <span>
        {footerContent.text}
        {footerContent.timestamp ? ` • ${footerContent.timestamp}` : ''}
      </span>
    </div>
  );
};
