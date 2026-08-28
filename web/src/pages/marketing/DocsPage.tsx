import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Rss, Terminal as TerminalIcon } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedPath } from '@/components/layout/navConfig';
import { SEO, buildBreadcrumbListSchema, buildWebSiteSchema } from '@/components/common/SEO';
import { OG_IMAGES } from '@/constants';
import { Tabs, Container, Stack, Text, Breadcrumbs } from '@/ui';
import { RelatedLinks } from '@/components/common/RelatedLinks/RelatedLinks';
import { DocsPermissionsPanel, DocsFeedsPanel, DocsCommandsPanel } from './docs';

export const DocsPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Determine active sub-section from URL pathname
  const cleanPath = location.pathname.toLowerCase().replace(/\/$/, '');
  let activeTab = 'setup';
  let subSectionLabel = '';
  let subSectionPath = '/docs';
  let pageTitle = `${t('docs.title')} ${t('docs.titleHighlight')}`;
  let pageDesc = t('docs.subtitle');

  if (cleanPath.endsWith('/commands')) {
    activeTab = 'commands';
    subSectionLabel = t('common.navDocsCommands') || 'Slash Commands';
    subSectionPath = '/docs/commands';
    pageTitle = `Slash Commands Reference — ${t('docs.title')}`;
    pageDesc = 'Comprehensive reference guide for Nova Feeds Discord bot slash commands, arguments, and usage examples.';
  } else if (cleanPath.endsWith('/feeds')) {
    activeTab = 'feeds';
    subSectionLabel = t('common.navDocsFeeds') || 'Feed Sources';
    subSectionPath = '/docs/feeds';
    pageTitle = `Supported Feed Platforms & Sources — ${t('docs.title')}`;
    pageDesc = 'Learn how to configure real-time notifications for YouTube, Twitch, Kick, Free Games, Steam, and RSS feeds.';
  } else if (cleanPath.endsWith('/setup') || cleanPath.endsWith('/permissions')) {
    activeTab = 'setup';
    subSectionLabel = t('common.navDocsSetup') || 'Setup Guide';
    subSectionPath = '/docs/setup';
    pageTitle = `Bot Setup & Permissions Guide — ${t('docs.title')}`;
    pageDesc = 'Step-by-step setup guide, webhook configuration, and required Discord permissions for Nova Feeds.';
  }

  const handleTabChange = (val: string) => {
    const targetPath = val === 'setup' ? '/docs' : `/docs/${val}`;
    navigate(getLocalizedPath(targetPath, lang));
  };

  const breadcrumbItems = [
    { label: t('common.navHome') || 'Home', href: getLocalizedPath('/', lang) },
    ...(subSectionLabel
      ? [
          { label: t('common.navDocs') || 'Documentation', href: getLocalizedPath('/docs', lang) },
          { label: subSectionLabel },
        ]
      : [{ label: t('common.navDocs') || 'Documentation' }]),
  ];

  const structuredData = [
    buildWebSiteSchema(),
    buildBreadcrumbListSchema(
      subSectionLabel
        ? [
            { name: 'Home', url: '/' },
            { name: t('common.navDocs') || 'Documentation', url: '/docs' },
            { name: subSectionLabel, url: subSectionPath },
          ]
        : [
            { name: 'Home', url: '/' },
            { name: t('common.navDocs') || 'Documentation', url: '/docs' },
          ]
    ),
  ];

  return (
    <Container maxWidth="md" padding="md">
      <SEO
        title={pageTitle}
        description={pageDesc}
        keywords="discord bot documentation, nova setup guide, slash commands reference, feed configuration, webhook integration, bot permissions"
        image={OG_IMAGES.docs}
        imageAlt="Nova Feeds Developer Guides and Command Documentation"
        canonicalPath={subSectionPath}
        structuredData={structuredData}
      />

      <Stack gap="5xl">
        <Breadcrumbs items={breadcrumbItems} />

        <Stack align="center" gap="md">
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('docs.title')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('docs.titleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {pageDesc}
            </Text>
          </Container>
        </Stack>

        {/* Tabs for Documentation Navigation */}
        <Tabs value={activeTab} onChange={handleTabChange} variant="pill">
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

        {/* Cross-linking & Related Resources */}
        <RelatedLinks current="docs" />
      </Stack>
    </Container>
  );
};

