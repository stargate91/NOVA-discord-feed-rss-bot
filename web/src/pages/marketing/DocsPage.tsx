import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Card } from '../../ui';
import styles from './MarketingPage.module.css';

export const DocsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.pageWrapper}>
      <SEO
        title={t('docs.tag')}
        description={t('docs.subtitle')}
      />

      <header className={styles.header}>
        <div className={styles.tag}>
          <BookOpen size={14} />
          <span>{t('docs.tag')}</span>
        </div>
        <h1 className={styles.title}>
          {t('docs.title')} <span>{t('docs.titleHighlight')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('docs.subtitle')}
        </p>
      </header>

      <div className={styles.sectionStack}>
        <Card title={t('docs.section1Title')}>
          <div className={styles.proseBlock}>
            <p>{t('docs.section1Desc')}</p>
            <ul>
              <li><strong>{t('docs.permSend')}</strong></li>
              <li><strong>{t('docs.permAttach')}</strong></li>
              <li><strong>{t('docs.permMention')}</strong></li>
            </ul>
          </div>
        </Card>

        <Card title={t('docs.section2Title')}>
          <div className={styles.proseBlock}>
            <p>{t('docs.section2Desc')}</p>
            <ul>
              <li><strong>{t('docs.typeYoutube')}</strong></li>
              <li><strong>{t('docs.typeStream')}</strong></li>
              <li><strong>{t('docs.typeGames')}</strong></li>
              <li><strong>{t('docs.typeTmdb')}</strong></li>
              <li><strong>{t('docs.typeRss')}</strong></li>
            </ul>
          </div>
        </Card>

        <Card title={t('docs.section3Title')}>
          <div className={styles.proseBlock}>
            <ul>
              <li><code>{t('docs.cmdAdd')}</code></li>
              <li><code>{t('docs.cmdList')}</code></li>
              <li><code>{t('docs.cmdTest')}</code></li>
              <li><code>{t('docs.cmdRemove')}</code></li>
              <li><code>{t('docs.cmdStatus')}</code></li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
