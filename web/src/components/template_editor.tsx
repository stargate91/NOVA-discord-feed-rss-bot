"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { TAG_DESCRIPTIONS } from '@/constants';
import { Button } from '@/components/ui';
import { useTemplateEditor } from '@/hooks/use_template_editor';
import { getGuildDashboardRoute } from '@/utils/navigation';
import { DiscordEmbedPreview } from './discord_embed_preview';
import defaultStyles from './template_editor.module.css';

export interface TemplateEditorProps {
  templates: Record<string, string>;
  onUpdate: (platform: string, newTemplateValue: string) => void;
  isLocked: boolean;
  guildId: string;
  styles?: Record<string, string>;
}

function renderTemplatePreview(template: string, platformName: string): string {
  if (!template || !template.trim()) {
    return `🚨 **New ${platformName} Post!**\n**Nova Cybernetics** has published a new update.\nhttps://youtube.com/watch?v=sample123`;
  }
  return template
    .replace(/{author}/g, 'Nova Cybernetics')
    .replace(/{title}/g, 'Project Awakening: First Neural Sync with a Class-4 Android')
    .replace(/{link}/g, 'https://youtube.com/watch?v=sample123')
    .replace(/{channel}/g, '#announcements')
    .replace(/{role}/g, '@Subscribers')
    .replace(/{game}/g, 'Cyberpunk 2077')
    .replace(/{viewers}/g, '1,420')
    .replace(/{price}/g, '$64,250')
    .replace(/{symbol}/g, 'BTC');
}

export default function TemplateEditor({
  templates,
  onUpdate,
  isLocked,
  guildId,
  styles: customStyles,
}: TemplateEditorProps) {
  const styles = customStyles || defaultStyles;
  const [showLivePreview, setShowLivePreview] = useState(false);

  const {
    platforms,
    activePlatform,
    setActivePlatform,
    currentPlatform,
    currentTemplate,
    handleTemplateChange,
    handleTagClick,
  } = useTemplateEditor({ templates, onUpdate });

  if (isLocked) {
    return (
      <div className={styles['lock-overlay']}>
        <Lock size={28} className={styles['lock-icon']} />
        <p className="text-body-sm">
          Custom templates require <strong>Professional Tier</strong> or above.
        </p>
        <Link href={getGuildDashboardRoute(guildId, 'billing')}>
          <Button variant="primary" size="sm">
            Upgrade Now
          </Button>
        </Link>
      </div>
    );
  }

  const previewDescription = renderTemplatePreview(currentTemplate, currentPlatform?.name || 'Platform');

  return (
    <div className={styles['template-wrapper']}>
      <div className={styles['platform-tabs']}>
        {platforms.map((p) => (
          <button
            key={p.id}
            type="button"
            className={[
              styles['platform-tab'],
              activePlatform === p.id && styles.active,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActivePlatform(p.id)}
          >
            <Image 
              src={p.icon} 
              alt={p.name} 
              width={18} 
              height={18} 
              unoptimized 
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className={styles['tags-hint']}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="text-caption">Available dynamic variables:</span>
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="text-caption"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-light)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {showLivePreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}
          </button>
        </div>
        <div className={styles['tags-list']}>
          {currentPlatform?.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles['tag-pill']}
              onClick={() => handleTagClick(tag)}
              title={TAG_DESCRIPTIONS[tag]}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className={styles['template-textarea']}
        placeholder="Enter your custom alert template markdown..."
        value={currentTemplate}
        onChange={(e) => handleTemplateChange(e.target.value)}
      />

      {showLivePreview && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <DiscordEmbedPreview
            botName="Nova"
            channelName="announcements"
            authorName="Nova Cybernetics"
            title={currentPlatform?.name ? `New ${currentPlatform.name} Notification` : 'New Notification'}
            description={previewDescription}
            publishedAt={new Date()}
            footerText="Delivered by Nova"
          />
        </div>
      )}
    </div>
  );
}

