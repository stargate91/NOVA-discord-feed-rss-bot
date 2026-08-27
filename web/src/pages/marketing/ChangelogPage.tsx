import React from 'react';
import { GitBranch } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Card, Badge } from '../../ui';
import styles from './MarketingPage.module.css';

export const ChangelogPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <SEO
        title={t('changelog.tag')}
        description={t('changelog.subtitle')}
      />

      <header className={styles.header}>
        <div className={styles.tag}>
          <GitBranch size={14} />
          <span>{t('changelog.tag')}</span>
        </div>
        <h1 className={styles.title}>
          {t('changelog.title')} <span>{t('changelog.titleHighlight')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('changelog.subtitle')}
        </p>
      </header>

      <div className={styles.sectionStack}>
        {/* Release v1.0.0 */}
        <Card
          title={t('changelog.v100Title')}
          subtitle={t('changelog.v100Subtitle')}
          action={<Badge variant="online">{t('changelog.v100Badge')}</Badge>}
        >
          <div className={styles.proseBlock}>
            <p>{t('changelog.v100Desc')}</p>
            <ul>
              <li><strong>{t('changelog.v100Feature1')}</strong></li>
              <li><strong>{t('changelog.v100Feature2')}</strong></li>
              <li><strong>{t('changelog.v100Feature3')}</strong></li>
              <li><strong>{t('changelog.v100Feature4')}</strong></li>
            </ul>
          </div>
        </Card>

        {/* Release v0.9.0 */}
        <Card
          title={t('changelog.v090Title')}
          subtitle={t('changelog.v090Subtitle')}
        >
          <div className={styles.proseBlock}>
            <ul>
              <li><strong>{t('changelog.v090Feature1')}</strong></li>
              <li><strong>{t('changelog.v090Feature2')}</strong></li>
              <li><strong>{t('changelog.v090Feature3')}</strong></li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
