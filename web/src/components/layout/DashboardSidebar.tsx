import React from 'react';
import { NavLink, Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ArrowLeft, Server } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Button, Select } from '@/ui';
import { DASHBOARD_NAV_ITEMS, SIDEBAR_SERVERS } from './sidebarConfig';
import styles from './DashboardSidebar.module.css';

export interface DashboardSidebarProps {
  onNavClick?: () => void;
  className?: string;
}

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
        <picture>
          <source type="image/avif" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
          <source type="image/webp" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
          <source type="image/jpeg" srcSet="/images/logo.jpg 1x, /images/logo.jpg 2x" />
          <img
            src="/images/logo.webp"
            srcSet="/images/logo.webp 1x, /images/logo.webp 2x"
            sizes="32px"
            alt="Nova Feeds — Discord Notification Bot Dashboard"
            width={32}
            height={32}
            decoding="async"
            className={styles.brandAvatar}
          />
        </picture>
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
      <nav className={styles.nav} aria-label="Dashboard navigation">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.pathSuffix}
              to={`/dashboard/${guildId}${item.pathSuffix}`}
              end={item.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={onNavClick}
            >
              <span className={styles.navIcon}>
                <IconComponent size={16} />
              </span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
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
