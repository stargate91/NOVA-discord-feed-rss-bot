import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Container, Stack, Text, Accordion } from '@/ui';

export const FaqSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm" centered>
      <Stack gap="xl">
        <Stack align="center" gap="2xs">
          <Text as="h2" size="2xl" weight="bold" align="center">
            {t('home.faqTitle')}
          </Text>
          <Text size="sm" color="secondary" align="center">
            {t('home.faqSubtitle')}
          </Text>
        </Stack>

        <Accordion type="single" variant="card" defaultValue="faq-1">
          <Accordion.Item value="faq-1">
            <Accordion.Trigger icon={<HelpCircle size={18} />}>
              {t('home.faq1Question')}
            </Accordion.Trigger>
            <Accordion.Content>{t('home.faq1Answer')}</Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="faq-2">
            <Accordion.Trigger icon={<HelpCircle size={18} />}>
              {t('home.faq2Question')}
            </Accordion.Trigger>
            <Accordion.Content>{t('home.faq2Answer')}</Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="faq-3">
            <Accordion.Trigger icon={<HelpCircle size={18} />}>
              {t('home.faq3Question')}
            </Accordion.Trigger>
            <Accordion.Content>{t('home.faq3Answer')}</Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="faq-4">
            <Accordion.Trigger icon={<HelpCircle size={18} />}>
              {t('home.faq4Question')}
            </Accordion.Trigger>
            <Accordion.Content>{t('home.faq4Answer')}</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Container>
  );
};
