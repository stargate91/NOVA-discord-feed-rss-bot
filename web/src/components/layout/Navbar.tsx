import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useParams } from 'react-router-dom';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronDown,
  Server,
  HelpCircle,
  Code,
} from 'lucide-react';
import type { HealthStatus } from '@/types';
import { useTranslation } from '@/i18n';
import { useAuth } from '@/auth';
import { ThemeToggle } from '@/theme';
import { Badge, Button, Dropdown, Avatar } from '@/ui';
import { DISCORD_SUPPORT_SERVER_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { NAV_ITEMS, getLocalizedPath } from './navConfig';
import { MobileNavDrawer } from './MobileNavDrawer';
import styles from './Navbar.module.css';

interface NavbarProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ health, loadingHealth }) => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithDiscord, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const isOnline = health?.status === 'ok' || health?.status === 'healthy';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const userAvatarSrc = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : user
    ? `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator || 0) % 5}.png`
    : undefined;

  const displayName = user?.global_name || user?.username || 'Discord User';

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to={getLocalizedPath('/', lang)} className={styles.brand} onClick={closeMobileMenu}>
          <img src="/images/logo.webp" alt="Nova Logo" className={styles.brandAvatar} />
          <span className={styles.brandText}>{t('common.brandName')}</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className={styles.navLinks}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={getLocalizedPath(item.path, lang)}
              end={item.end}
              className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.active : ''}`}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <ThemeToggle />

          {loadingHealth ? (
            <Badge variant="neutral">{t('common.checking')}</Badge>
          ) : isOnline ? (
            <Badge variant="online" dot>
              {t('common.statusOnline')}
            </Badge>
          ) : (
            <Badge variant="offline" dot>
              {t('common.statusOffline')}
            </Badge>
          )}

          {/* Authentication & User Dropdown */}
          {isAuthenticated && user ? (
            <Dropdown align="end">
              <Dropdown.Trigger>
                <button type="button" className={styles.userProfileBtn} aria-label="User Account Menu">
                  <Avatar
                    src={userAvatarSrc}
                    name={displayName}
                    size="xs"
                    status="online"
                  />
                  <span className={styles.userNameText}>{displayName}</span>
                  <ChevronDown size={14} />
                </button>
              </Dropdown.Trigger>
              <Dropdown.Menu>
                <Dropdown.Header>
                  <div className={styles.userProfileHeader}>
                    <Avatar
                      src={userAvatarSrc}
                      name={displayName}
                      size="sm"
                    />
                    <div className={styles.userProfileInfo}>
                      <span className={styles.userProfileName}>{displayName}</span>
                      <span className={styles.userProfileTag}>
                        @{user.username}
                      </span>
                    </div>
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item
                  icon={<Server size={15} />}
                  onClick={() => navigate('/servers')}
                >
                  {t('common.navServers')}
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<Code size={15} />}
                  onClick={() => navigate('/dev')}
                >
                  {t('common.navDev')}
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<HelpCircle size={15} />}
                  onClick={() => openExternalUrl(DISCORD_SUPPORT_SERVER_URL)}
                >
                  {t('common.navSupport')}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  danger
                  icon={<LogOut size={15} />}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  {t('common.logout')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button
              variant="discord"
              size="sm"
              onClick={() => loginWithDiscord()}
            >
              <LogIn size={14} /> {t('common.loginWithDiscord')}
            </Button>
          )}

          {/* Dashboard Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/servers');
              } else {
                loginWithDiscord();
              }
            }}
          >
            {t('common.dashboard')}
          </Button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileNavDrawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </header>
  );
};
