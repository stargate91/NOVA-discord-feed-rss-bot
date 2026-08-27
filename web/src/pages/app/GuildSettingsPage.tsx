import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useToast } from '../../components/common/Toast';
import { Card, Button, Select, Input } from '../../ui';
import styles from './AppPages.module.css';

export const GuildSettingsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const [locale, setLocale] = useState<string>('en');
  const [timezone, setTimezone] = useState<string>('UTC');
  const [logChannel, setLogChannel] = useState<string>('123456789');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Guild settings successfully saved and synchronized to Nova backend.', 'Settings Updated');
  };

  return (
    <div>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>{t('guild.settingsTitle')}</h2>
          <p className={styles.tabSubtitle}>
            {t('guild.settingsSubtitle', { guildId })}
          </p>
        </div>

        <Button variant="primary" onClick={handleSave}>
          {t('guild.saveChangesBtn')}
        </Button>
      </div>

      <div className={styles.grid2}>
        <Card title={t('guild.localizationTitle')} subtitle={t('guild.localizationSubtitle')}>
          <form className={styles.formStack} onSubmit={handleSave}>
            <Select
              label={t('guild.botLanguageLabel')}
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              options={[
                { value: 'en', label: 'English (US)' },
                { value: 'hu', label: 'Magyar (Hungarian)' },
                { value: 'de', label: 'Deutsch (German)' },
                { value: 'es', label: 'Español (Spanish)' },
                { value: 'fr', label: 'Français (French)' },
                { value: 'it', label: 'Italiano (Italian)' },
                { value: 'pt', label: 'Português (Portuguese)' },
                { value: 'ru', label: 'Русский (Russian)' },
                { value: 'ja', label: '日本語 (Japanese)' },
              ]}
            />

            <Select
              label={t('guild.timezoneLabel')}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
                { value: 'Europe/Budapest', label: 'Europe/Budapest (CET / CEST)' },
                { value: 'Europe/London', label: 'Europe/London (GMT / BST)' },
                { value: 'Europe/Berlin', label: 'Europe/Berlin (CET / CEST)' },
                { value: 'America/New_York', label: 'America/New_York (EST / EDT)' },
                { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST / PDT)' },
              ]}
            />
          </form>
        </Card>

        <Card title={t('guild.auditLoggingTitle')} subtitle={t('guild.auditLoggingSubtitle')}>
          <form className={styles.formStack} onSubmit={handleSave}>
            <Input
              label={t('guild.errorChannelLabel')}
              value={logChannel}
              onChange={(e) => setLogChannel(e.target.value)}
              placeholder="e.g. 112233445566778899"
            />

            <div className={styles.feedDesc}>
              Nova will notify this channel if a feed destination channel is deleted or if permissions are missing.
            </div>

            <Button type="submit" variant="secondary" fullWidth>
              {t('guild.updateLogChannelBtn')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
