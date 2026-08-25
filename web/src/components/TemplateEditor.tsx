"use client";

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { TEMPLATE_PLATFORMS, TAG_DESCRIPTIONS } from '@/constants';

interface TemplateEditorProps {
  templates: Record<string, string>;
  onUpdate: (platform: string, newTemplateValue: string) => void;
  isLocked: boolean;
  guildId: string;
  styles: Record<string, string>;
}

export default function TemplateEditor({ templates, onUpdate, isLocked, guildId, styles }: TemplateEditorProps) {
  const [activePlatform, setActivePlatform] = useState(TEMPLATE_PLATFORMS[0].id);

  const currentPlatform = TEMPLATE_PLATFORMS.find(p => p.id === activePlatform);

  if (isLocked) {
    return (
      <div className={styles.premiumLockOverlay}>
        <Lock size={32} />
        <p>Available for Professional Tier & above</p>
        <Link href={`/dashboard/${guildId}/billing`}>
          <button className={styles.upgradeBtnSmall}>Upgrade Now</button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.templateEditorWrapper}>
      <div className={styles.platformTabs}>
        {TEMPLATE_PLATFORMS.map(p => (
          <button
            key={p.id}
            className={`${styles.platformTab} ${activePlatform === p.id ? styles.active : ''}`}
            onClick={() => setActivePlatform(p.id)}
          >
            <img src={p.icon} alt={p.name} className={styles.tabIconImg} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.editorContainer}>
        <div className={styles.tagsHint}>
          <div className={styles.tagsHintHeader}>
            <span>Available dynamic tags (click to insert):</span>
          </div>
          <div className={styles.tagsList}>
            {currentPlatform?.tags.map(tag => (
              <button
                key={tag}
                className={styles.tagPill}
                onClick={() => onUpdate(activePlatform, (templates[activePlatform] || "") + tag)}
                title={TAG_DESCRIPTIONS[tag]}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className={styles.templateTextarea}
          placeholder="Enter your custom template..."
          value={templates[activePlatform] || ""}
          onChange={(e) => onUpdate(activePlatform, e.target.value)}
        />
      </div>
    </div>
  );
}
