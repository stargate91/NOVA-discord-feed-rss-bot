import React from 'react';
import { useTranslation } from '@/i18n';
import { Inline, Chip } from '@/ui';

export const BRAND_CHIPS = [
  { labelKey: 'home.brandYoutube', icon: '/images/brands/youtube.png' },
  { labelKey: 'home.brandTwitch', icon: '/images/brands/twitch.png' },
  { labelKey: 'home.brandKick', icon: '/images/brands/kick.png' },
  { labelKey: 'home.brandEpic', icon: '/images/brands/epic_games.png' },
  { labelKey: 'home.brandSteam', icon: '/images/brands/steam.png' },
  { labelKey: 'home.brandGog', icon: '/images/brands/gog.png' },
  { labelKey: 'home.brandTmdb', icon: '/images/brands/tmdb.png' },
  { labelKey: 'home.brandGithub', icon: '/images/brands/github.png' },
  { labelKey: 'home.brandRss', icon: '/images/brands/rss.png' },
] as const;

export interface PlatformChipsBarProps {
  align?: 'start' | 'center';
}

export const PlatformChipsBar: React.FC<PlatformChipsBarProps> = ({ align = 'center' }) => {
  const { t } = useTranslation();

  return (
    <Inline justify={align} gap="sm" wrap>
      {BRAND_CHIPS.map((chip) => (
        <Chip key={chip.labelKey} label={t(chip.labelKey)} icon={chip.icon} />
      ))}
    </Inline>
  );
};
