"use client";

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { TEMPLATE_PLATFORMS, TAG_DESCRIPTIONS } from '@/constants';
import { Button } from '@/components/ui';

export interface TemplateEditorProps {
  templates: Record<string, string>;
  onUpdate: (platform: string, newTemplateValue: string) => void;
  isLocked: boolean;
  guildId: string;
  styles: Record<string, string>;
}

export default function TemplateEditor({
  templates,
  onUpdate,
  isLocked,
  guildId,
  styles,
}: TemplateEditorProps) {
  const [activePlatform, setActivePlatform] = useState(TEMPLATE_PLATFORMS[0].id);
  const currentPlatform = TEMPLATE_PLATFORMS.find((p) => p.id === activePlatform);

  if (isLocked) {
    return (
      <div className={styles['lock-overlay']}>
        <Lock size={28} className={styles['lock-icon']} />
        <p className="text-body-sm">
          Custom templates require <strong>Professional Tier</strong> or above.
        </p>
        <Link href={`/dashboard/${guildId}/billing`}>
          <Button variant="primary" size="sm">
            Upgrade Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles['template-wrapper']}>
      <div className={styles['platform-tabs']}>
        {TEMPLATE_PLATFORMS.map((p) => (
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
            <img src={p.icon} alt={p.name} width={18} height={18} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className={styles['tags-hint']}>
        <span className="text-caption">Available dynamic variables:</span>
        <div className={styles['tags-list']}>
          {currentPlatform?.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles['tag-pill']}
              onClick={() =>
                onUpdate(activePlatform, (templates[activePlatform] || '') + tag)
              }
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
        value={templates[activePlatform] || ''}
        onChange={(e) => onUpdate(activePlatform, e.target.value)}
      />
    </div>
  );
}
