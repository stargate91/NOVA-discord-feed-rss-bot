import React from 'react';
import { BookOpen, ShieldCheck, Rss, Terminal as TerminalIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Badge, Card, Tabs, Chip, Table, Container, Stack, Inline, Text } from '../../ui';

export const DocsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
      <SEO
        title={t('docs.tag')}
        description={t('docs.subtitle')}
      />

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
            <Tabs.Tab value="setup" icon={<ShieldCheck size={16} />}>{t('docs.tabSetup')}</Tabs.Tab>
            <Tabs.Tab value="feeds" icon={<Rss size={16} />}>{t('docs.tabFeeds')}</Tabs.Tab>
            <Tabs.Tab value="commands" icon={<TerminalIcon size={16} />}>{t('docs.tabCommands')}</Tabs.Tab>
          </Tabs.List>

          {/* Setup & Permissions */}
          <Tabs.Panel value="setup">
            <Card glow="blue" padding="xl">
              <Card.Header>
                <Card.Title>{t('docs.section1Title')}</Card.Title>
              </Card.Header>
              <Card.Description>{t('docs.section1Desc')}</Card.Description>
              <Card.Body>
                <Table variant="glass" density="normal">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>{t('docs.tableHeadPermission')}</Table.Head>
                      <Table.Head>{t('docs.tableHeadPurpose')}</Table.Head>
                      <Table.Head align="center">{t('docs.tableHeadStatus')}</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell><strong>{t('docs.permSend')}</strong></Table.Cell>
                      <Table.Cell>{t('docs.permSendDesc')}</Table.Cell>
                      <Table.Cell align="center"><Badge variant="online" dot>{t('docs.badgeRequired')}</Badge></Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><strong>{t('docs.permAttach')}</strong></Table.Cell>
                      <Table.Cell>{t('docs.permAttachDesc')}</Table.Cell>
                      <Table.Cell align="center"><Badge variant="online" dot>{t('docs.badgeRequired')}</Badge></Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><strong>{t('docs.permMention')}</strong></Table.Cell>
                      <Table.Cell>{t('docs.permMentionDesc')}</Table.Cell>
                      <Table.Cell align="center"><Badge variant="tier">{t('docs.badgeOptional')}</Badge></Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Card.Body>
            </Card>
          </Tabs.Panel>

          {/* Supported Feeds */}
          <Tabs.Panel value="feeds">
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
          </Tabs.Panel>

          {/* Slash Commands Reference */}
          <Tabs.Panel value="commands">
            <Card glow="purple" padding="xl">
              <Card.Header>
                <Card.Title>{t('docs.section3Title')}</Card.Title>
              </Card.Header>
              <Card.Description>{t('docs.section3Desc')}</Card.Description>
              <Card.Body>
                <Table variant="glass" density="normal">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>{t('docs.tableHeadCommand')}</Table.Head>
                      <Table.Head>{t('docs.tableHeadDescription')}</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell><code>{t('docs.cmdAdd')}</code></Table.Cell>
                      <Table.Cell>{t('docs.cmdAddDesc')}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><code>{t('docs.cmdList')}</code></Table.Cell>
                      <Table.Cell>{t('docs.cmdListDesc')}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><code>{t('docs.cmdTest')}</code></Table.Cell>
                      <Table.Cell>{t('docs.cmdTestDesc')}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><code>{t('docs.cmdRemove')}</code></Table.Cell>
                      <Table.Cell>{t('docs.cmdRemoveDesc')}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><code>{t('docs.cmdStatus')}</code></Table.Cell>
                      <Table.Cell>{t('docs.cmdStatusDesc')}</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Card.Body>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};

