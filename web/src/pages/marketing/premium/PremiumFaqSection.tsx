import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Stack, Text, Accordion } from '@/ui';

export const PremiumFaqSection: React.FC = () => {
  const { t } = useTranslation();

  return (
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
  );
};
