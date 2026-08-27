import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, Server, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Button } from '@/ui';
import styles from './NotFoundPage.module.css';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <SEO title={t('common.notFoundTitle')} description={t('common.notFoundDesc')} noIndex />
      <div className={styles.container}>
        <div className={styles.glowOrb} />
        <div className={styles.content}>
          <div className={styles.badge404}>
            <Compass size={14} />
            <span>{t('common.notFoundTitle')}</span>
          </div>

          <div className={styles.codeNumber}>404</div>

          <h1 className={styles.headline}>{t('common.notFoundHeadline')}</h1>
          <p className={styles.description}>{t('common.notFoundDesc')}</p>

          <div className={styles.actions}>
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              <Home size={16} />
              <span>{t('common.notFoundBackHome')}</span>
            </Button>

            <Button variant="secondary" size="lg" onClick={() => navigate('/servers')}>
              <Server size={16} />
              <span>{t('common.notFoundGoServers')}</span>
            </Button>

            <Button variant="outline" size="lg" onClick={() => navigate('/support')}>
              <HelpCircle size={16} />
              <span>{t('common.notFoundContactSupport')}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
