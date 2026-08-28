import React from 'react';
import { useParams } from 'react-router-dom';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedPath } from '@/components/layout/navConfig';
import { SEO, buildFaqPageSchema, buildBreadcrumbListSchema } from '@/components/common/SEO';
import { DISCORD_SUPPORT_SERVER_URL, OG_IMAGES } from '@/constants';
import { Card, Button, Accordion, Container, Stack, Text, Breadcrumbs } from '@/ui';
import { RelatedLinks } from '@/components/common/RelatedLinks/RelatedLinks';

export const SupportPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  const supportFaqs = [
    { question: t('support.faqStreamQ'), answer: t('support.faqStreamA') },
    { question: t('support.faqLanguageQ'), answer: t('support.faqLanguageA') },
    { question: t('support.faqRoleQ'), answer: t('support.faqRoleA') },
  ];

  const breadcrumbItems = [
    { label: t('common.navHome') || 'Home', href: getLocalizedPath('/', lang) },
    { label: t('common.navSupport') || 'Support' },
  ];

  const structuredData = [
    buildFaqPageSchema(supportFaqs),
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: t('common.navSupport'), url: '/support' },
    ]),
  ];

  return (
    <Container maxWidth="md" padding="md">
      <SEO
        title={`${t('support.title')} ${t('support.titleHighlight')}`}
        description={t('support.subtitle')}
        keywords="discord bot support, nova troubleshooting, discord help server, feed setup assistance, bot customer service"
        image={OG_IMAGES.support}
        imageAlt="Nova Feeds Support Center and Community Assistance"
        structuredData={structuredData}
      />

      <Stack gap="5xl">
        <Breadcrumbs items={breadcrumbItems} />

        <Stack align="center" gap="md">
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
                  as="a"
                  variant="discord"
                  size="lg"
                  href={DISCORD_SUPPORT_SERVER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
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

        {/* Cross-linking & Related Resources */}
        <RelatedLinks current="support" />
      </Stack>
    </Container>
  );
};
