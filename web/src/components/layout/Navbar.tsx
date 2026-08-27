import React, { useState } from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import type { HealthStatus } from '@/types';
import { useTranslation } from '@/i18n';
import { ThemeToggle } from '@/theme';
import { Badge, Button } from '@/ui';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const isOnline = health?.status === 'ok' || health?.status === 'healthy';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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

          <Link to="/servers" onClick={closeMobileMenu}>
            <Button variant="primary" size="sm">
              {t('common.dashboard')}
            </Button>
          </Link>

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
