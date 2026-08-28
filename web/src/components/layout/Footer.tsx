import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { Container, Grid, Stack, Inline, Text } from '@/ui';
import { getLocalizedPath } from './navConfig';
import { FOOTER_RESOURCES_LINKS, FOOTER_LEGAL_LINKS } from './footerConfig';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <Container maxWidth="xl" padding="lg">
        <Stack gap="3xl">
          <Grid minItemWidth="sm" gap="2xl">
            {/* Brand column */}
            <Stack gap="md">
              <Inline align="center" gap="md">
                <picture>
                  <source type="image/avif" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
                  <source type="image/webp" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
                  <source type="image/jpeg" srcSet="/images/logo.jpg 1x, /images/logo.jpg 2x" />
                  <img
                    src="/images/logo.webp"
                    srcSet="/images/logo.webp 1x, /images/logo.webp 2x"
                    sizes="36px"
                    alt="Nova Feeds — Next-Generation Discord Notification Bot"
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className={styles.logo}
                  />
                </picture>
                <Text size="lg" weight="bold">
                  {t('common.brandName')}
                </Text>
              </Inline>
              <Text size="sm" color="secondary" className={styles.desc}>
                {t('home.heroDescription')}
              </Text>
            </Stack>

            {/* Resources column */}
            <Stack as="nav" aria-label="Footer resources navigation" gap="md">
              <Text as="h4" size="xs" weight="bold" color="brand" className={styles.colHeader}>
                {t('common.footerResources')}
              </Text>
              <Stack as="ul" gap="xs" className={styles.linkList}>
                {FOOTER_RESOURCES_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link to={getLocalizedPath(link.path || '', lang)} className={styles.linkBtn}>
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>

            {/* Legal column */}
            <Stack as="nav" aria-label="Footer legal and support navigation" gap="md">
              <Text as="h4" size="xs" weight="bold" color="brand" className={styles.colHeader}>
                {t('common.footerLegalSupport')}
              </Text>
              <Stack as="ul" gap="xs" className={styles.linkList}>
                {FOOTER_LEGAL_LINKS.map((link) => (
                  <li key={link.path || link.externalUrl}>
                    {link.externalUrl ? (
                      <a
                        href={link.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.linkBtn}
                      >
                        {t(link.labelKey)}
                      </a>
                    ) : (
                      <Link to={getLocalizedPath(link.path || '', lang)} className={styles.linkBtn}>
                        {t(link.labelKey)}
                      </Link>
                    )}
                  </li>
                ))}
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
