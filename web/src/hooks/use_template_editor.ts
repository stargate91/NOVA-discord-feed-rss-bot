import { useState, useMemo, useCallback } from 'react';
import { TEMPLATE_PLATFORMS, TemplatePlatform } from '@/constants/platforms';
import { appendTemplateTag } from '@/utils/monitor_form';

export interface UseTemplateEditorOptions {
  templates: Record<string, string>;
  onUpdate: (platform: string, newTemplateValue: string) => void;
  defaultPlatformId?: string;
}

export function useTemplateEditor({
  templates,
  onUpdate,
  defaultPlatformId = TEMPLATE_PLATFORMS[0]?.id || 'twitch',
}: UseTemplateEditorOptions) {
  const [activePlatform, setActivePlatform] = useState<string>(defaultPlatformId);

  const currentPlatform = useMemo<TemplatePlatform | undefined>(() => {
    return TEMPLATE_PLATFORMS.find((p) => p.id === activePlatform);
  }, [activePlatform]);

  const currentTemplate = templates[activePlatform] || '';

  const handleTemplateChange = useCallback(
    (newVal: string) => {
      onUpdate(activePlatform, newVal);
    },
    [activePlatform, onUpdate]
  );

  const handleTagClick = useCallback(
    (tag: string) => {
      const updated = appendTemplateTag(templates[activePlatform], tag);
      onUpdate(activePlatform, updated);
    },
    [activePlatform, templates, onUpdate]
  );

  return {
    platforms: TEMPLATE_PLATFORMS,
    activePlatform,
    setActivePlatform,
    currentPlatform,
    currentTemplate,
    handleTemplateChange,
    handleTagClick,
  };
}
