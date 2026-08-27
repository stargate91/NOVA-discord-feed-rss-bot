import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, LayoutDashboard } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { DISCORD_BOT_INVITE_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { Badge, Button, Stack, Inline, Text, Container } from '@/ui';
import { PlatformChipsBar } from './PlatformChipsBar';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Stack align="center" gap="2xl">
      <Stack align="center" gap="md">
        <Badge variant="online" size="md" dot pulse>
          <Sparkles size={14} /> {t('home.heroTag')}
        </Badge>
        <Text as="h1" size="hero" weight="extrabold" align="center">
          {t('home.heroTitle')}{' '}
          <Text as="span" color="gradient" size="hero" weight="extrabold">
            {t('home.heroTitleHighlight')}
          </Text>
        </Text>
        <Container maxWidth="md" centered>
          <Text size="lg" color="secondary" align="center">
            {t('home.heroDescription')}
          </Text>
        </Container>
      </Stack>

      <Inline gap="md" justify="center" wrap>
        <Button
          variant="primary"
          size="lg"
          onClick={() => openExternalUrl(DISCORD_BOT_INVITE_URL)}
        >
          <Plus size={18} /> {t('home.ctaDiscord')}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate('/servers')}>
          <LayoutDashboard size={18} /> {t('home.ctaDashboard')}
        </Button>
      </Inline>

      <PlatformChipsBar />
    </Stack>
  );
};
