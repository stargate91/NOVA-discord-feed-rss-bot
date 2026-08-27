import React from 'react';
import { Ticket } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Button, Input, Field, Alert, Stack } from '@/ui';
import type { UseGuildSubscriptionReturn } from '../types';

interface PromoCodeCardProps {
  subscription: UseGuildSubscriptionReturn;
}

export const PromoCodeCard: React.FC<PromoCodeCardProps> = ({ subscription }) => {
  const { t } = useTranslation();
  const { promoCode, setPromoCode, applyPromoCode, isApplyingPromo } = subscription;

  return (
    <Card
      glow="purple"
      padding="xl"
      title={t('guild.redeemPromoTitle')}
      subtitle={t('guild.redeemPromoSubtitle')}
    >
      <Stack gap="lg">
        <form onSubmit={applyPromoCode}>
          <Stack gap="md">
            <Field label={t('guild.promoCodeInputLabel')} hint={t('guild.promoCodeHint')}>
              <Input
                leftIcon={<Ticket size={15} />}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t('guild.promoCodePlaceholder')}
                clearable
              />
            </Field>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              fullWidth
              disabled={isApplyingPromo}
            >
              {t('guild.applyPromoBtn')}
            </Button>
          </Stack>
        </form>

        <Alert
          variant="info"
          title={t('guild.partnershipBenefitsTitle')}
          description={t('guild.partnershipBenefitsDesc')}
        />
      </Stack>
    </Card>
  );
};
