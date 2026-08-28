import React from 'react';
import { NavLink, Link, useNavigate, useParams } from 'react-router-dom';
import { LogIn, LogOut, Server, Code } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useAuth, isMasterAdmin } from '@/auth';
import { Button, Drawer, Stack, Avatar } from '@/ui';
import { NAV_ITEMS, getLocalizedPath } from './navConfig';
import styles from './Navbar.module.css';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const { lang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithDiscord, logout } = useAuth();

  const userAvatarSrc = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : user
      ? `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator || 0) % 5}.png`
      : undefined;

  const displayName = user?.global_name || user?.username || 'Discord User';

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      position="right"
      size="sm"
      title={
        <Link to={getLocalizedPath('/', lang)} className={styles.brand} onClick={onClose}>
          <picture>
            <source type="image/avif" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
            <source type="image/webp" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
            <source type="image/jpeg" srcSet="/images/logo.jpg 1x, /images/logo.jpg 2x" />
            <img
              src="/images/logo.webp"
              srcSet="/images/logo.webp 1x, /images/logo.webp 2x"
              sizes="32px"
              alt="Nova Feeds — Next-Generation Discord Notification Bot"
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
              className={styles.brandAvatar}
            />
          </picture>
          <span className={styles.brandText}>{t('common.brandName')}</span>
        </Link>
      }
      footer={
        <div className={styles.drawerFooter}>
          {isAuthenticated && user ? (
            <div className={styles.mobileUserCard}>
              <div className={styles.mobileUserInfo}>
                <Avatar src={userAvatarSrc} name={displayName} size="sm" status="online" />
                <div className={styles.userProfileInfo}>
                  <span className={styles.userProfileName}>{displayName}</span>
                  <span className={styles.userProfileTag}>@{user.username}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  onClose();
                  navigate('/');
                }}
              >
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <Button
              variant="discord"
              size="md"
              fullWidth
              onClick={() => {
                onClose();
                loginWithDiscord();
              }}
            >
              <LogIn size={16} /> {t('common.loginWithDiscord')}
            </Button>
          )}
        </div>
      }
    >
      <Stack as="nav" aria-label="Mobile navigation" gap="xs">
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

        {isAuthenticated && (
          <NavLink
            to="/servers"
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <span className={styles.mobileNavLabel}>
              <Server size={18} /> {t('common.navServers')}
            </span>
          </NavLink>
        )}

        {isAuthenticated && isMasterAdmin(user?.id) && (
          <NavLink
            to="/dev"
            className={({ isActive }) => `${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <span className={styles.mobileNavLabel}>
              <Code size={18} /> {t('common.navDev')}
            </span>
          </NavLink>
        )}
      </Stack>
    </Drawer>
  );
};
