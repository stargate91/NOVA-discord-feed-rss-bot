import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Button, Badge, CardSkeleton } from '../../ui';
import styles from './AppPages.module.css';

interface ServerItem {
  id: string;
  name: string;
  avatar: string;
  tier: string;
  isBotInServer: boolean;
  monitors: number;
}

export const ServerPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mockServers: ServerItem[] = [
    {
      id: '123456789012345678',
      name: 'Stargate Gaming Lounge',
      avatar: '/images/logo.webp',
      tier: 'Plus Tier',
      isBotInServer: true,
      monitors: 8,
    },
    {
      id: '987654321098765432',
      name: 'Creator Hub VIP',
      avatar: '/images/logo.webp',
      tier: 'Master Tier',
      isBotInServer: true,
      monitors: 24,
    },
    {
      id: '555666777888999000',
      name: 'Community Anime & Hangout',
      avatar: '/images/logo.webp',
      tier: 'Free',
      isBotInServer: false,
      monitors: 0,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <SEO
        title={t('servers.title')}
        description={t('servers.subtitle')}
      />

      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>{t('servers.title')}</h2>
          <p className={styles.tabSubtitle}>
            {t('servers.subtitle')}
          </p>
        </div>

        <Button
          variant="discord"
          onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=1489908793780338688&permissions=277025508352&scope=bot%20applications.commands', '_blank')}
        >
          <Plus size={14} /> {t('servers.addBot')}
        </Button>
      </div>

      <div className={styles.grid3}>
        {isLoading
          ? [1, 2, 3].map((key) => (
              <CardSkeleton key={`skeleton-server-${key}`} lines={3} />
            ))
          : mockServers.map((server) => (
              <div key={server.id} className={styles.serverCard}>
                <div>
                  <div className={styles.serverHeader}>
                    <img src={server.avatar} alt={server.name} className={styles.serverAvatar} />
                    <div>
                      <h3 className={styles.serverName}>{server.name}</h3>
                      <span className={styles.serverId}>{server.id}</span>
                    </div>
                  </div>

                  <div className={styles.serverStats}>
                    <div className={styles.statRow}>
                      <span>{t('servers.statusLabel')}</span>
                      <Badge variant={server.isBotInServer ? 'online' : 'neutral'}>
                        {server.isBotInServer ? t('servers.statusActive') : t('servers.statusNotInvited')}
                      </Badge>
                    </div>
                    <div className={styles.statRow}>
                      <span>{t('servers.planLabel')}</span>
                      <Badge variant="tier">{server.tier}</Badge>
                    </div>
                    <div className={styles.statRow}>
                      <span>{t('servers.activeFeedsLabel')}</span>
                      <span className={styles.statValue}>
                        {t('servers.monitorsCount', { count: server.monitors })}
                      </span>
                    </div>
                  </div>
                </div>

                {server.isBotInServer ? (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate(`/dashboard/${server.id}`)}
                  >
                    {t('servers.manageBtn')}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=1489908793780338688&permissions=277025508352&scope=bot%20applications.commands', '_blank')}
                  >
                    {t('servers.inviteBtn')}
                  </Button>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};
