import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { DISCORD_SUPPORT_SERVER_URL } from '@/constants';
import { Container, Grid, Stack, Inline, Text } from '@/ui';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  const getLangPath = (path: string) => {
    if (!lang || lang === 'en') {
      return path;
    }
    return `/${lang}${path === '/' ? '' : path}`;
  };

  return (
    <footer className={styles.footer}>
      <Container maxWidth="xl" padding="lg">
        <Stack gap="3xl">
          <Grid minItemWidth="sm" gap="2xl">
            {/* Brand column */}
            <Stack gap="md">
              <Inline align="center" gap="md">
                <img src="/images/logo.webp" alt="Nova Logo" className={styles.logo} />
                <Text size="lg" weight="bold">
                  {t('common.brandName')}
                </Text>
              </Inline>
              <Text size="sm" color="secondary" className={styles.desc}>
                {t('home.heroDescription')}
              </Text>
            </Stack>

            {/* Resources column */}
            <Stack gap="md">
              <Text as="h4" size="xs" weight="bold" color="brand" className={styles.colHeader}>
                {t('common.footerResources')}
              </Text>
              <Stack as="ul" gap="xs" className={styles.linkList}>
                <li>
                  <Link to={getLangPath('/docs')} className={styles.linkBtn}>
                    {t('common.navDocs')}
                  </Link>
                </li>
                <li>
                  <Link to={getLangPath('/premium')} className={styles.linkBtn}>
                    {t('common.navPremium')}
                  </Link>
                </li>
                <li>
                  <Link to={getLangPath('/changelog')} className={styles.linkBtn}>
                    {t('common.navChangelog')}
                  </Link>
                </li>
                <li>
                  <Link to={getLangPath('/support')} className={styles.linkBtn}>
                    {t('common.navSupport')}
                  </Link>
                </li>
                <li>
                  <Link to="/dev" className={styles.linkBtn}>
                    {t('common.navDev')}
                  </Link>
                </li>
              </Stack>
            </Stack>

            {/* Legal column */}
            <Stack gap="md">
              <Text as="h4" size="xs" weight="bold" color="brand" className={styles.colHeader}>
                {t('common.footerLegalSupport')}
              </Text>
              <Stack as="ul" gap="xs" className={styles.linkList}>
                <li>
                  <Link to={getLangPath('/terms')} className={styles.linkBtn}>
                    {t('legal.termsTitleHighlight')}
                  </Link>
                </li>
                <li>
                  <Link to={getLangPath('/privacy')} className={styles.linkBtn}>
                    {t('legal.privacyTitleHighlight')}
                  </Link>
                </li>
                <li>
                  <a
                    href={DISCORD_SUPPORT_SERVER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.linkBtn}
                  >
                    {t('support.discordCta')}
                  </a>
                </li>
              </Stack>
            </Stack>
          </Grid>

          <div className={styles.footerDivider} />

          <Inline justify="between" align="center" wrap gap="md">
            <Text size="xs" color="muted">
              {t('common.copyright')}
            </Text>
            <Text size="xs" color="muted">
              {t('common.version')}
            </Text>
          </Inline>
        </Stack>
      </Container>
    </footer>
  );
};
