import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Crown, HelpCircle, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedPath } from '@/components/layout/navConfig';
import { Card, Grid, Stack, Text, Inline } from '@/ui';
import styles from './RelatedLinks.module.css';

export interface RelatedLinkItem {
  key: 'docs' | 'premium' | 'support' | 'changelog';
  titleKey: string;
  descKey: string;
  path: string;
  icon: React.ReactNode;
}

const ALL_LINKS: Record<string, RelatedLinkItem> = {
  docs: {
    key: 'docs',
    titleKey: 'common.navDocs',
    descKey: 'docs.subtitle',
    path: '/docs',
    icon: <BookOpen size={20} className={styles.iconDocs} />,
  },
  premium: {
    key: 'premium',
    titleKey: 'common.navPremium',
    descKey: 'premium.subtitle',
    path: '/premium',
    icon: <Crown size={20} className={styles.iconPremium} />,
  },
  support: {
    key: 'support',
    titleKey: 'common.navSupport',
    descKey: 'support.discordSubtitle',
    path: '/support',
    icon: <HelpCircle size={20} className={styles.iconSupport} />,
  },
  changelog: {
    key: 'changelog',
    titleKey: 'common.navChangelog',
    descKey: 'changelog.subtitle',
    path: '/changelog',
    icon: <Sparkles size={20} className={styles.iconChangelog} />,
  },
};

export interface RelatedLinksProps {
  current: 'home' | 'docs' | 'premium' | 'support' | 'changelog' | 'legal';
}

export const RelatedLinks: React.FC<RelatedLinksProps> = ({ current }) => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  const linksToShow = Object.values(ALL_LINKS).filter((item) => item.key !== current).slice(0, 3);

  return (
    <section aria-labelledby="related-pages-heading" className={styles.container}>
      <Stack gap="xl">
        <Text as="h2" id="related-pages-heading" size="xl" weight="bold">
          {t('common.exploreMore') || 'Explore More Resources'}
        </Text>

        <Grid minItemWidth="sm" gap="lg">
          {linksToShow.map((item) => (
            <Link
              key={item.key}
              to={getLocalizedPath(item.path, lang)}
              className={styles.cardLink}
            >
              <Card interactive padding="lg" className={styles.card}>
                <Stack gap="sm">
                  <Inline align="center" justify="between">
                    <Inline align="center" gap="sm">
                      <div className={styles.iconBox}>{item.icon}</div>
                      <Text as="h3" size="md" weight="bold">
                        {t(item.titleKey as any)}
                      </Text>
                    </Inline>
                    <ArrowRight size={16} className={styles.arrow} />
                  </Inline>
                  <Text size="xs" color="secondary" className={styles.desc}>
                    {t(item.descKey as any)}
                  </Text>
                </Stack>
              </Card>
            </Link>
          ))}
        </Grid>
      </Stack>
    </section>
  );
};
