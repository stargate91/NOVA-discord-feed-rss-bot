import React, { useState } from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import type { HealthStatus } from '../../types';
import { useTranslation } from '../../i18n';
import { Badge, Button } from '../../ui';
import styles from './Navbar.module.css';

interface NavbarProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loadingHealth,
}) => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const isOnline = health?.status === 'ok' || health?.status === 'healthy';

  // Helper to build language-prefixed marketing routes
  const getLangPath = (path: string) => {
    if (!lang || lang === 'en') {
      return path;
    }
    return `/${lang}${path === '/' ? '' : path}`;
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to={getLangPath('/')} className={styles.brand} onClick={closeMobileMenu}>
          <img src="/images/logo.webp" alt="Nova Logo" className={styles.brandAvatar} />
          <span className={styles.brandText}>{t('common.brandName')}</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className={styles.navLinks}>
          <NavLink
            to={getLangPath('/')}
            end
            className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.active : ''}`}
          >
            {t('common.navOverview')}
          </NavLink>
          <NavLink
            to={getLangPath('/premium')}
            className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.active : ''}`}
          >
            {t('common.navPremium')}
          </NavLink>
          <NavLink
            to={getLangPath('/docs')}
            className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.active : ''}`}
          >
            {t('common.navDocs')}
          </NavLink>
          <NavLink
            to={getLangPath('/support')}
            className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.active : ''}`}
          >
            {t('common.navSupport')}
          </NavLink>
          <NavLink
            to={getLangPath('/changelog')}
            className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.active : ''}`}
          >
            {t('common.navChangelog')}
          </NavLink>
          <NavLink
            to="/dev"
            className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.active : ''}`}
          >
            {t('common.navDev')}
          </NavLink>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {loadingHealth ? (
            <Badge variant="neutral">{t('common.checking')}</Badge>
          ) : isOnline ? (
            <Badge variant="online" dot>{t('common.statusOnline')}</Badge>
          ) : (
            <Badge variant="offline" dot>{t('common.statusOffline')}</Badge>
          )}

          <Link to="/servers" onClick={closeMobileMenu}>
            <Button variant="primary" size="sm">
              {t('common.dashboard')}
            </Button>
          </Link>

          {/* Mobile Hamburger Button with Lucide Icons */}
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <nav className={styles.mobileDrawer}>
          <NavLink
            to={getLangPath('/')}
            end
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={closeMobileMenu}
          >
            {t('common.navOverview')}
          </NavLink>
          <NavLink
            to={getLangPath('/premium')}
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={closeMobileMenu}
          >
            {t('common.navPremium')}
          </NavLink>
          <NavLink
            to={getLangPath('/docs')}
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={closeMobileMenu}
          >
            {t('common.navDocs')}
          </NavLink>
          <NavLink
            to={getLangPath('/support')}
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={closeMobileMenu}
          >
            {t('common.navSupport')}
          </NavLink>
          <NavLink
            to={getLangPath('/changelog')}
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={closeMobileMenu}
          >
            {t('common.navChangelog')}
          </NavLink>
          <NavLink
            to="/dev"
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={closeMobileMenu}
          >
            {t('common.navDev')}
          </NavLink>
        </nav>
      )}
    </header>
  );
};
