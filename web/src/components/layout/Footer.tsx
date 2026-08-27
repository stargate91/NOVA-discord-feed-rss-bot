import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
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
      <div className={styles.inner}>
        {/* Brand column */}
        <div className={styles.brand}>
          <div className={styles.brandHeader}>
            <img src="/images/logo.webp" alt="Nova Logo" className={styles.logo} />
            <span>{t('common.brandName')}</span>
          </div>
          <p className={styles.desc}>
            {t('home.heroDescription')}
          </p>
        </div>

        {/* Resources column */}
        <div className={styles.col}>
          <h4>Resources</h4>
          <ul>
            <li><Link to={getLangPath('/docs')} className={styles.linkBtn}>{t('common.navDocs')}</Link></li>
            <li><Link to={getLangPath('/premium')} className={styles.linkBtn}>{t('common.navPremium')}</Link></li>
            <li><Link to={getLangPath('/changelog')} className={styles.linkBtn}>{t('common.navChangelog')}</Link></li>
            <li><Link to={getLangPath('/support')} className={styles.linkBtn}>{t('common.navSupport')}</Link></li>
            <li><Link to="/dev" className={styles.linkBtn}>{t('common.navDev')}</Link></li>
          </ul>
        </div>

        {/* Legal column */}
        <div className={styles.col}>
          <h4>Legal & Support</h4>
          <ul>
            <li><Link to={getLangPath('/terms')} className={styles.linkBtn}>{t('legal.termsTitleHighlight')}</Link></li>
            <li><Link to={getLangPath('/privacy')} className={styles.linkBtn}>{t('legal.privacyTitleHighlight')}</Link></li>
            <li>
              <a
                href="https://discord.gg/PbvX3S7pXR"
                target="_blank"
                rel="noreferrer"
                className={styles.linkBtn}
              >
                {t('support.discordCta')}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>{t('common.copyright')}</span>
        <span>{t('common.version')}</span>
      </div>
    </footer>
  );
};
