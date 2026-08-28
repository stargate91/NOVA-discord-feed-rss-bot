import React from 'react';
import { Check, Minus } from 'lucide-react';
import type { TranslationKey } from '@/i18n';
import { useTranslation } from '@/i18n';
import { Stack, Text, Badge, Container } from '@/ui';
import styles from './TierComparisonTable.module.css';

type TierId = 'free' | 'starter' | 'professional' | 'ultimate';

interface ComparisonRow {
  labelKey: TranslationKey;
  values: Record<TierId, boolean | string | TranslationKey>;
  isI18nValue?: boolean;
}

interface ComparisonCategory {
  categoryKey: TranslationKey;
  rows: ComparisonRow[];
}

const COMPARISON_DATA: ComparisonCategory[] = [
  {
    categoryKey: 'premium.tableCatQuotas',
    rows: [
      {
        labelKey: 'premium.rowMaxMonitors',
        values: { free: '5', starter: '15', professional: '35', ultimate: '100' },
      },
      {
        labelKey: 'premium.rowRefreshInterval',
        values: {
          free: 'premium.val20Min',
          starter: 'premium.val10Min',
          professional: 'premium.val5Min',
          ultimate: 'premium.val1Min',
        },
        isI18nValue: true,
      },
      {
        labelKey: 'premium.rowMaxChannels',
        values: { free: '1', starter: '5', professional: '10', ultimate: '20' },
      },
      {
        labelKey: 'premium.rowMaxPings',
        values: { free: '1', starter: '5', professional: '10', ultimate: '20' },
      },
      {
        labelKey: 'premium.rowMaxPurge',
        values: { free: '10', starter: '25', professional: '50', ultimate: '100' },
      },
    ],
  },
  {
    categoryKey: 'premium.tableCatPlatforms',
    rows: [
      {
        labelKey: 'premium.rowPlatformStandard',
        values: { free: true, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowPlatformGames',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowPlatformMovies',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowPlatformSteamNews',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowPlatformCrypto',
        values: { free: false, starter: false, professional: false, ultimate: true },
      },
    ],
  },
  {
    categoryKey: 'premium.tableCatCustomization',
    rows: [
      {
        labelKey: 'premium.rowCustomColor',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowAlertTemplate',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowCustomTemplate',
        values: { free: false, starter: false, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowGenreFilter',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowRemoveBranding',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
    ],
  },
  {
    categoryKey: 'premium.tableCatAdvanced',
    rows: [
      {
        labelKey: 'premium.rowRepost',
        values: { free: false, starter: false, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowBulkDelete',
        values: { free: false, starter: true, professional: true, ultimate: true },
      },
      {
        labelKey: 'premium.rowCsvExport',
        values: { free: false, starter: false, professional: false, ultimate: true },
      },
    ],
  },
  {
    categoryKey: 'premium.tableCatDelivery',
    rows: [
      {
        labelKey: 'premium.rowPriorityDelivery',
        values: {
          free: 'premium.valStandardQueue',
          starter: 'premium.valStandardQueue',
          professional: 'premium.valPriorityQueue',
          ultimate: 'premium.valPriorityQueue',
        },
        isI18nValue: true,
      },
      {
        labelKey: 'premium.rowSupport',
        values: {
          free: 'premium.valCommunitySupport',
          starter: 'premium.valPrioritySupport',
          professional: 'premium.valPrioritySupport',
          ultimate: 'premium.valVipSupport',
        },
        isI18nValue: true,
      },
    ],
  },
];

const TIERS: { id: TierId; nameKey: TranslationKey; pillKey?: TranslationKey; badgeVariant: 'neutral' | 'online' | 'tier' }[] = [
  { id: 'free', nameKey: 'premium.freeTitle', badgeVariant: 'neutral' },
  { id: 'starter', nameKey: 'premium.starterTitle', badgeVariant: 'neutral' },
  { id: 'professional', nameKey: 'premium.professionalTitle', pillKey: 'premium.professionalBadge', badgeVariant: 'online' },
  { id: 'ultimate', nameKey: 'premium.ultimateTitle', pillKey: 'premium.ultimateBadge', badgeVariant: 'tier' },
];

export const TierComparisonTable: React.FC = () => {
  const { t } = useTranslation();

  const renderCellContent = (
    val: boolean | string | TranslationKey,
    isI18nValue?: boolean,
    tierId?: TierId
  ) => {
    if (typeof val === 'boolean') {
      return val ? (
        <span className={styles.checkIcon} aria-label="Included">
          <Check size={18} />
        </span>
      ) : (
        <span className={styles.dashIcon} aria-label="Not included">
          <Minus size={16} />
        </span>
      );
    }

    const textToDisplay = isI18nValue ? t(val as TranslationKey) : String(val);
    const isHighlighted = tierId === 'professional' || tierId === 'ultimate';

    return (
      <span className={`${styles.valueText} ${isHighlighted ? styles.valueHighlight : ''}`}>
        {textToDisplay}
      </span>
    );
  };

  return (
    <div className={styles.wrapper}>
      <Stack gap="xl">
        <Stack align="center" gap="2xs" className={styles.tableHeaderSection}>
          <Text as="h2" size="2xl" weight="bold" align="center">
            {t('premium.tableTitle')}
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="sm" color="secondary" align="center">
              {t('premium.tableSubtitle')}
            </Text>
          </Container>
        </Stack>

        <div className={styles.tableCard}>
          <div className={styles.tableResponsiveContainer}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th className={`${styles.thHead} ${styles.thFeatureCol}`}>
                    {t('premium.tableColumnFeature')}
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier.id}
                      className={`${styles.thHead} ${styles.thTierCol} ${tier.id === 'professional' ? styles.highlightCol : ''}`}
                    >
                      <div className={styles.tierHeaderBox}>
                        <Badge variant={tier.badgeVariant} size="sm">
                          {t(tier.nameKey)}
                        </Badge>
                        {tier.pillKey && (
                          <Badge variant="tier" size="xs">
                            {t(tier.pillKey)}
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((category) => (
                  <React.Fragment key={category.categoryKey}>
                    <tr className={styles.categoryRow}>
                      <td colSpan={5} className={styles.categoryCell}>
                        {t(category.categoryKey)}
                      </td>
                    </tr>
                    {category.rows.map((row) => (
                      <tr key={row.labelKey} className={styles.tableRow}>
                        <td className={styles.featureCell}>{t(row.labelKey)}</td>
                        {TIERS.map((tier) => (
                          <td
                            key={tier.id}
                            className={`${styles.valueCell} ${tier.id === 'professional' ? styles.highlightCol : ''}`}
                          >
                            {renderCellContent(row.values[tier.id], row.isI18nValue, tier.id)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Stack>
    </div>
  );
};
