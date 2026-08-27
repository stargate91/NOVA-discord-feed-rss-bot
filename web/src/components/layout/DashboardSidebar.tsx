import React from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import {
  Activity,
  Radio,
  BarChart3,
  Sparkles,
  SlidersHorizontal,
  ArrowLeftRight,
  ArrowLeft,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Button } from '../../ui';
import styles from './DashboardSidebar.module.css';

export const DashboardSidebar: React.FC = () => {
  const { guildId = '123456789012345678' } = useParams<{ guildId?: string }>();
  const { t } = useTranslation();

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <Link to="/" className={styles.brand}>
        <img src="/images/logo.webp" alt="Nova Logo" className={styles.brandAvatar} />
        <span className={styles.brandTitle}>{t('common.brandName')}</span>
      </Link>

      {/* Guild Switcher Box */}
      <div className={styles.guildPicker}>
        <div className={styles.guildLabel}>{t('common.navServers')}</div>
        <div className={styles.guildSelect}>
          <span>ID: {guildId}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className={styles.nav}>
        <NavLink
          to={`/dashboard/${guildId}`}
          end
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.navIcon}><Activity size={16} /></span>
          <span>{t('guild.overviewTitle')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/feeds`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.navIcon}><Radio size={16} /></span>
          <span>{t('common.navFeeds')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/analytics`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.navIcon}><BarChart3 size={16} /></span>
          <span>{t('common.navAnalytics')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/premium`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.navIcon}><Sparkles size={16} /></span>
          <span>{t('common.navPremium')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/settings`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.navIcon}><SlidersHorizontal size={16} /></span>
          <span>{t('common.navGuildSettings')}</span>
        </NavLink>
      </nav>

      {/* Bottom Action */}
      <div className={styles.bottom}>
        <Link to="/servers">
          <Button variant="secondary" size="sm" fullWidth>
            <ArrowLeftRight size={14} /> {t('common.navSwitchServer')}
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="sm" fullWidth>
            <ArrowLeft size={14} /> {t('common.navPublicWebsite')}
          </Button>
        </Link>
      </div>
    </aside>
  );
};
