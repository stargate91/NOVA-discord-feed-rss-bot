import React from 'react';
import { useTranslation } from '@/i18n';
import { Card, Inline, Chip } from '@/ui';

export const DocsFeedsPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card glow="green" padding="xl">
      <Card.Header>
        <Card.Title>{t('docs.section2Title')}</Card.Title>
      </Card.Header>
      <Card.Description>{t('docs.section2Desc')}</Card.Description>
      <Card.Body>
        <Inline gap="sm" wrap>
          <Chip label={t('docs.typeYoutube')} icon="/images/brands/youtube.png" />
          <Chip label={t('docs.typeStream')} icon="/images/brands/twitch.png" />
          <Chip label={t('docs.chipKick')} icon="/images/brands/kick.png" />
          <Chip label={t('docs.typeGames')} icon="/images/brands/steam.png" />
          <Chip label={t('docs.chipEpic')} icon="/images/brands/epic_games.png" />
          <Chip label={t('docs.typeTmdb')} icon="/images/brands/tmdb.png" />
          <Chip label={t('docs.chipGithub')} icon="/images/brands/github.png" />
          <Chip label={t('docs.typeRss')} icon="/images/brands/rss.png" />
        </Inline>
      </Card.Body>
    </Card>
  );
};
