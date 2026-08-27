import React, { useRef, useEffect, memo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { DiscordEmbedProps } from './types';
import { EmbedAuthor } from './DiscordEmbedAuthor';
import { DiscordEmbedFields } from './DiscordEmbedFields';
import { EmbedFooter } from './DiscordEmbedFooter';
import styles from './DiscordEmbed.module.css';

export * from './types';
export * from './DiscordEmbedAuthor';
export * from './DiscordEmbedFields';
export * from './DiscordEmbedFooter';

const renderDiscordMarkdown = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    const parts = line.split(/(\*\*.*?\*\*|~~.*?~~|`.*?`)/g);
    const parsedLine = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className={styles.sectionAuthor}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={pIdx}>{part.slice(2, -2)}</del>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={pIdx}>{part.slice(1, -1)}</code>;
      }
      return part;
    });

    return (
      <React.Fragment key={lIdx}>
        {lIdx > 0 && <br />}
        {parsedLine}
      </React.Fragment>
    );
  });
};

const DiscordEmbedComponent: React.FC<DiscordEmbedProps> = ({
  channelName = 'feed-alerts',
  botName = 'Nova',
  avatarUrl = '/images/logo.webp',
  timestamp = 'Today at 18:20',
  roleMention,
  alertText,
  alertUrl,
  platformIcon,
  author,
  title,
  titleUrl = '#',
  description,
  metaLines,
  fields,
  thumbnail,
  image,
  accessoryButton,
  buttons,
  footer,
  footerText = 'Delivered by',
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

  // Determine if we should render Discord Components V2 layout
  const isComponentV2 = Boolean(platformIcon || metaLines || accessoryButton || image);

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

          {(roleMention || alertText || alertUrl) && (
            <div className={styles.messageContent}>
              {roleMention && <span className={styles.roleMention}>{roleMention}</span>}
              {alertText && <span>{alertText}</span>}
              {alertUrl && (
                <a href={alertUrl} target="_blank" rel="noreferrer" className={styles.alertLink}>
                  {alertUrl}
                </a>
              )}
            </div>
          )}

          <div ref={embedBoxRef} className={styles.embedBox}>
            {isComponentV2 ? (
              <>
                {/* 1. Main Title with inline platform icon */}
                <a href={titleUrl} className={styles.v2Title} target="_blank" rel="noreferrer">
                  {platformIcon && (
                    <img
                      src={platformIcon}
                      alt="Platform"
                      className={styles.platformIcon}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span>{title}</span>
                </a>

                {/* 2. Full-width 16:9 Media Banner */}
                {image && (
                  <img
                    src={image}
                    alt="Media Banner"
                    className={styles.mediaBanner}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                {/* Optional description excerpt */}
                {description && <p className={styles.desc}>{description}</p>}

                {/* 3. Section with Accessory Button */}
                {(author || metaLines || accessoryButton || (fields && fields.length > 0)) && (
                  <div className={styles.sectionWithAccessory}>
                    <div className={styles.sectionContent}>
                      {author?.name && <div className={styles.sectionAuthor}>{author.name}</div>}
                      {metaLines?.map((line, idx) => (
                        <div key={idx} className={styles.sectionMeta}>
                          {renderDiscordMarkdown(line)}
                        </div>
                      ))}
                      {fields && fields.length > 0 && !metaLines && (
                        <DiscordEmbedFields fields={fields} />
                      )}
                    </div>

                    {accessoryButton && (
                      <a
                        href={accessoryButton.url || titleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.accessoryButton}
                      >
                        <span>{accessoryButton.label}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}

                {/* Optional multi-button action row (for TMDB, etc.) */}
                {buttons && buttons.length > 0 && (
                  <div className={styles.actionRow}>
                    {buttons.map((btn) => (
                      <a
                        key={btn.label}
                        href={btn.url || titleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.accessoryButton}
                      >
                        <span>{btn.label}</span>
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                )}

                {/* 4. Separator */}
                <div className={styles.separator} />

                {/* 5. Footer / Branding */}
                <div className={styles.brandingFooter}>
                  <span>{footerText}</span>
                  <span className={styles.brandHighlight}>Nova</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.embedHeaderLayout}>
                  <div className={styles.embedMain}>
                    <EmbedAuthor author={author} />

                    <a href={titleUrl} className={styles.title} target="_blank" rel="noreferrer">
                      {title}
                    </a>

                    {description && <p className={styles.desc}>{description}</p>}
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
                    className={styles.mediaBanner}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                {children}

                <EmbedFooter footer={footer} footerText={footerText} />
              </>
            )}
          </div>

          {components && <div className={styles.componentsContainer}>{components}</div>}
        </div>
      </div>
    </div>
  );
};

export const DiscordEmbed = memo(DiscordEmbedComponent);
