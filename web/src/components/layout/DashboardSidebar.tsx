import React from 'react';
import { NavLink, Link, useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  Radio,
  BarChart3,
  Sparkles,
  SlidersHorizontal,
  ArrowLeftRight,
  ArrowLeft,
  Server,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Button, Select } from '../../ui';
import styles from './DashboardSidebar.module.css';

export interface DashboardSidebarProps {
  onNavClick?: () => void;
  className?: string;
}

const SIDEBAR_SERVERS = [
  { value: '123456789012345678', labelKey: 'guild.sidebarServer1Label', descKey: 'guild.sidebarServer1Desc' },
  { value: '987654321098765432', labelKey: 'guild.sidebarServer2Label', descKey: 'guild.sidebarServer2Desc' },
  { value: '555666777888999000', labelKey: 'guild.sidebarServer3Label', descKey: 'guild.sidebarServer3Desc' },
] as const;

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  onNavClick,
  className = '',
}) => {
  const { guildId = '123456789012345678' } = useParams<{ guildId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <aside className={`${styles.sidebar} ${className}`}>
      {/* Brand Header */}
      <Link to="/" className={styles.brand} onClick={onNavClick}>
        <img src="/images/logo.webp" alt="Nova Logo" className={styles.brandAvatar} />
        <span className={styles.brandTitle}>{t('common.brandName')}</span>
      </Link>

      {/* Guild Switcher Dropdown */}
      <div className={styles.guildPicker}>
        <div className={styles.guildLabel}>{t('common.navServers')}</div>
        <Select
          size="sm"
          variant="filled"
          leftIcon={<Server size={13} />}
          value={guildId}
          onValueChange={(newId) => {
            if (newId) navigate(`/dashboard/${newId}`);
          }}
          options={SIDEBAR_SERVERS.map((s) => ({
            value: s.value,
            label: t(s.labelKey),
            description: t(s.descKey),
          }))}
        />
      </div>


      {/* Navigation Links */}
      <nav className={styles.nav}>
        <NavLink
          to={`/dashboard/${guildId}`}
          end
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          onClick={onNavClick}
        >
          <span className={styles.navIcon}><Activity size={16} /></span>
          <span>{t('guild.overviewTitle')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/feeds`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          onClick={onNavClick}
        >
          <span className={styles.navIcon}><Radio size={16} /></span>
          <span>{t('common.navFeeds')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/analytics`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          onClick={onNavClick}
        >
          <span className={styles.navIcon}><BarChart3 size={16} /></span>
          <span>{t('common.navAnalytics')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/premium`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          onClick={onNavClick}
        >
          <span className={styles.navIcon}><Sparkles size={16} /></span>
          <span>{t('common.navPremium')}</span>
        </NavLink>

        <NavLink
          to={`/dashboard/${guildId}/settings`}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          onClick={onNavClick}
        >
          <span className={styles.navIcon}><SlidersHorizontal size={16} /></span>
          <span>{t('common.navGuildSettings')}</span>
        </NavLink>
      </nav>

      {/* Bottom Action */}
      <div className={styles.bottom}>
        <Link to="/servers" onClick={onNavClick}>
          <Button variant="secondary" size="sm" fullWidth>
            <ArrowLeftRight size={14} /> {t('common.navSwitchServer')}
          </Button>
        </Link>
        <Link to="/" onClick={onNavClick}>
          <Button variant="secondary" size="sm" fullWidth>
            <ArrowLeft size={14} /> {t('common.navPublicWebsite')}
          </Button>
        </Link>
      </div>
    </aside>
  );
};
