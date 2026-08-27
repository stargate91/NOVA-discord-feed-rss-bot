import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Button, Badge, Stack, Inline, Text } from '@/ui';
import { MOCK_OVERVIEW_METRICS } from '../constants';

interface PlanDetailsSummaryCardProps {
  guildId: string;
}

export const PlanDetailsSummaryCard: React.FC<PlanDetailsSummaryCardProps> = ({ guildId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card title={t('guild.planDetailsTitle')} subtitle={t('guild.planDetailsSubtitle')}>
      <Stack gap="md">
        <Stack gap="xs">
          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('guild.activeTierLabel')}
            </Text>
            <Badge variant="online" dot pulse>
              {t('guild.activeTierValue')}
            </Badge>
          </Inline>
          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('guild.refreshIntervalLabel')}
            </Text>
            <Text size="xs" weight="semibold">
              {t('guild.refreshIntervalValue', {
                seconds: MOCK_OVERVIEW_METRICS.refreshIntervalSeconds,
              })}
            </Text>
          </Inline>
          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('guild.promoCodeLabel')}
            </Text>
            <Badge variant="tier">{t('guild.promoCodeApplied')}</Badge>
          </Inline>
        </Stack>

        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate(`/dashboard/${guildId}/premium`)}
        >
          <ArrowUpRight size={14} /> {t('guild.upgradePlanBtn')}
        </Button>
      </Stack>
    </Card>
  );
};
