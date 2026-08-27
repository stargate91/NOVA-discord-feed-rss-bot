import React from 'react';
import { BookOpen, ShieldCheck, Rss, Terminal as TerminalIcon } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Badge, Tabs, Container, Stack, Text } from '@/ui';
import { DocsPermissionsPanel, DocsFeedsPanel, DocsCommandsPanel } from './docs';

export const DocsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
      <SEO title={t('docs.tag')} description={t('docs.subtitle')} />

      <Stack gap="5xl">
        <Stack align="center" gap="md">
          <Badge variant="outline" size="md" dot pulse>
            <BookOpen size={14} /> {t('docs.tag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('docs.title')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('docs.titleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('docs.subtitle')}
            </Text>
          </Container>
        </Stack>

        {/* Tabs for Documentation Navigation */}
        <Tabs defaultValue="setup" variant="pill">
          <Tabs.List>
            <Tabs.Tab value="setup" icon={<ShieldCheck size={16} />}>
              {t('docs.tabSetup')}
            </Tabs.Tab>
            <Tabs.Tab value="feeds" icon={<Rss size={16} />}>
              {t('docs.tabFeeds')}
            </Tabs.Tab>
            <Tabs.Tab value="commands" icon={<TerminalIcon size={16} />}>
              {t('docs.tabCommands')}
            </Tabs.Tab>
          </Tabs.List>

          {/* Setup & Permissions */}
          <Tabs.Panel value="setup">
            <DocsPermissionsPanel />
          </Tabs.Panel>

          {/* Supported Feeds */}
          <Tabs.Panel value="feeds">
            <DocsFeedsPanel />
          </Tabs.Panel>

          {/* Slash Commands Reference */}
          <Tabs.Panel value="commands">
            <DocsCommandsPanel />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};
