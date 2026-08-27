import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Button, Badge, Card, Accordion, Container, Stack, Inline, Grid, Text } from '@/ui';

export const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
      <SEO title={t('premium.tag')} description={t('premium.subtitle')} />

      <Stack gap="5xl">
        <Stack align="center" gap="md">
          <Badge variant="tier" size="md" dot pulse>
            <Sparkles size={14} /> {t('premium.tag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('premium.title')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('premium.titleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('premium.subtitle')}
            </Text>
          </Container>
        </Stack>

        {/* Pricing Grid with Upgraded Cards */}
        <Grid minItemWidth="sm" gap="2xl">
          {/* Free Plan */}
          <Card padding="xl">
            <Stack gap="lg" justify="between">
              <Stack gap="sm">
                <Inline justify="between" align="center">
                  <Badge variant="neutral">{t('premium.freeTitle')}</Badge>
                </Inline>
                <Inline align="baseline" gap="xs">
                  <Text size="4xl" weight="black">
                    {t('premium.freePrice')}
                  </Text>
                  <Text size="sm" color="muted">
                    {t('premium.freePricePeriod')}
                  </Text>
                </Inline>
                <Text size="sm" color="secondary">
                  {t('premium.freeDesc')}
                </Text>
                <Stack as="ul" gap="sm">
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.freeFeature1')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.freeFeature2')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.freeFeature3')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.freeFeature4')}</Text>
                  </Inline>
                </Stack>
              </Stack>
              <Button variant="secondary" fullWidth onClick={() => navigate('/servers')}>
                {t('premium.freeCta')}
              </Button>
            </Stack>
          </Card>

          {/* Plus Plan (Featured Glow) */}
          <Card glow="blue" padding="xl" interactive>
            <Stack gap="lg" justify="between">
              <Stack gap="sm">
                <Inline justify="between" align="center">
                  <Badge variant="online">{t('premium.plusTitle')}</Badge>
                  <Badge variant="tier">{t('premium.plusBadge')}</Badge>
                </Inline>
                <Inline align="baseline" gap="xs">
                  <Text size="4xl" weight="black">
                    {t('premium.plusPrice')}
                  </Text>
                  <Text size="sm" color="muted">
                    {t('premium.plusPricePeriod')}
                  </Text>
                </Inline>
                <Text size="sm" color="secondary">
                  {t('premium.plusDesc')}
                </Text>
                <Stack as="ul" gap="sm">
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.plusFeature1')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.plusFeature2')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.plusFeature3')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.plusFeature4')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.plusFeature5')}</Text>
                  </Inline>
                </Stack>
              </Stack>
              <Button variant="primary" fullWidth onClick={() => navigate('/servers')}>
                {t('premium.plusCta')}
              </Button>
            </Stack>
          </Card>

          {/* Master Plan */}
          <Card glow="purple" padding="xl" interactive>
            <Stack gap="lg" justify="between">
              <Stack gap="sm">
                <Inline justify="between" align="center">
                  <Badge variant="tier">{t('premium.masterTitle')}</Badge>
                </Inline>
                <Inline align="baseline" gap="xs">
                  <Text size="4xl" weight="black">
                    {t('premium.masterPrice')}
                  </Text>
                  <Text size="sm" color="muted">
                    {t('premium.masterPricePeriod')}
                  </Text>
                </Inline>
                <Text size="sm" color="secondary">
                  {t('premium.masterDesc')}
                </Text>
                <Stack as="ul" gap="sm">
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.masterFeature1')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.masterFeature2')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.masterFeature3')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.masterFeature4')}</Text>
                  </Inline>
                  <Inline as="li" gap="sm" align="center">
                    <Check size={14} color="var(--status-success)" />
                    <Text size="sm">{t('premium.masterFeature5')}</Text>
                  </Inline>
                </Stack>
              </Stack>
              <Button variant="secondary" fullWidth onClick={() => navigate('/servers')}>
                {t('premium.masterCta')}
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* FAQ Section with Accordion */}
        <Stack gap="xl">
          <Text as="h2" size="2xl" weight="bold" align="center">
            {t('premium.faqTitle')}
          </Text>
          <Accordion type="single" variant="card" defaultValue="prem-q1">
            <Accordion.Item value="prem-q1">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('premium.faqQ1')}
              </Accordion.Trigger>
              <Accordion.Content>{t('premium.faqA1')}</Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="prem-q2">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('premium.faqQ2')}
              </Accordion.Trigger>
              <Accordion.Content>{t('premium.faqA2')}</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Stack>
    </Container>
  );
};
