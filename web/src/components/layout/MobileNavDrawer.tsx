import React from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { ThemeToggle } from '@/theme';
import { Button, Drawer, Stack } from '@/ui';
import { NAV_ITEMS, getLocalizedPath } from './navConfig';
import styles from './Navbar.module.css';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      position="right"
      size="sm"
      title={
        <Link to={getLocalizedPath('/', lang)} className={styles.brand} onClick={onClose}>
          <img src="/images/logo.webp" alt="Nova Logo" className={styles.brandAvatar} />
          <span className={styles.brandText}>{t('common.brandName')}</span>
        </Link>
      }
      footer={
        <div className={styles.drawerFooter}>
          <ThemeToggle />
          <Link to="/servers" onClick={onClose} className={styles.drawerDashboardLink}>
            <Button variant="primary" size="lg" fullWidth>
              {t('common.dashboard')}
            </Button>
          </Link>
        </div>
      }
    >
      <Stack gap="xs">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={getLocalizedPath(item.path, lang)}
            end={item.end}
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </Stack>
    </Drawer>
  );
};
