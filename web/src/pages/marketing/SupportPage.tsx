import React from 'react';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { DISCORD_SUPPORT_SERVER_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { Card, Button, Badge, Accordion, Container, Stack, Text } from '@/ui';

export const SupportPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
      <SEO title={t('support.tag')} description={t('support.subtitle')} />

      <Stack gap="5xl">
        <Stack align="center" gap="md">
          <Badge variant="outline" size="md" dot pulse>
            <HelpCircle size={14} /> {t('support.tag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('support.title')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('support.titleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('support.subtitle')}
            </Text>
          </Container>
        </Stack>

        {/* Direct Discord Support Card */}
        <Card glow="blue" padding="xl">
          <Card.Header>
            <Card.Title>{t('support.discordTitle')}</Card.Title>
          </Card.Header>
          <Card.Description>{t('support.discordSubtitle')}</Card.Description>
          <Card.Body>
            <Stack gap="xl">
              <Text color="secondary">{t('support.discordDesc')}</Text>
              <div>
                <Button
                  variant="discord"
                  size="lg"
                  onClick={() => openExternalUrl(DISCORD_SUPPORT_SERVER_URL)}
                >
                  <MessageSquare size={18} /> {t('support.discordCta')}
                </Button>
              </div>
            </Stack>
          </Card.Body>
        </Card>

        {/* Common Troubleshooting FAQ */}
        <Stack gap="xl">
          <Text as="h2" size="2xl" weight="bold" align="center">
            {t('support.faqTitle')}
          </Text>
          <Accordion type="single" variant="card" defaultValue="support-q1">
            <Accordion.Item value="support-q1">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('support.faqStreamQ')}
              </Accordion.Trigger>
              <Accordion.Content>{t('support.faqStreamA')}</Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="support-q2">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('support.faqLanguageQ')}
              </Accordion.Trigger>
              <Accordion.Content>{t('support.faqLanguageA')}</Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="support-q3">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('support.faqRoleQ')}
              </Accordion.Trigger>
              <Accordion.Content>{t('support.faqRoleA')}</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Stack>
    </Container>
  );
};
