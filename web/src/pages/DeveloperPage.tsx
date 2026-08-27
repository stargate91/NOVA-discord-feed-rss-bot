import React, { useState } from 'react';
import { RefreshCw, ExternalLink, LogOut, Key } from 'lucide-react';
import { apiClient } from '../api';
import { useAuth } from '../auth';
import { useTranslation } from '../i18n';
import { useToast } from '../components/common/Toast';
import { SEO } from '../components/common/SEO';
import {
  Button,
  Card,
  Input,
  Terminal,
  Badge,
  Alert,
  ProgressBar,
  Select,
  Container,
  Stack,
  Inline,
  Grid,
  Text,
} from '../ui';

interface AdminLogsResponse {
  logs?: string[];
}

const LOG_LEVEL_OPTIONS = [
  { value: 'all', labelKey: 'dev.logLevelAll' },
  { value: 'info', labelKey: 'dev.logLevelInfo' },
  { value: 'warn', labelKey: 'dev.logLevelWarn' },
  { value: 'error', labelKey: 'dev.logLevelError' },
  { value: 'debug', labelKey: 'dev.logLevelDebug' },
] as const;

export const DeveloperPage: React.FC = () => {
  const { adminSecret, setAdminSecretKey, clearAdminSecretKey } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const [secretInput, setSecretInput] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(Boolean(adminSecret));
  const [adminLogs, setAdminLogs] = useState<string[]>([]);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [adminMessage, setAdminMessage] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<string>('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) {
      toast.warning('Please enter a secret key.', 'Input Required');
      return;
    }

    try {
      const data = await apiClient.get<AdminLogsResponse>('/api/v1/admin/logs?limit=10', {
        adminSecret: secretInput.trim(),
      });

      setAdminSecretKey(secretInput.trim());
      setIsAdminAuthenticated(true);
      setAdminLogs(data.logs || ['[INFO] Successfully authenticated to Developer Portal.']);
      setAdminMessage('Authentication successful!');
      toast.success('Authenticated to Developer Console.', 'Access Granted');
    } catch {
      setAdminMessage('Invalid Secret Key. Access Denied.');
      toast.error('Invalid Developer Secret Key or Connection Error.', 'Access Denied');
    }
  };

  const handleForceSync = async () => {
    setSyncStatus('Synchronizing...');
    try {
      await apiClient.post('/api/v1/monitors/sync', undefined, {
        adminSecret: adminSecret || secretInput,
      });
      setSyncStatus('Monitors successfully synchronized!');
      toast.success('Monitors cache reloaded from database.', 'Sync Complete');
    } catch {
      setSyncStatus('Failed to sync monitors.');
      toast.error('Failed to trigger monitor sync.', 'Sync Error');
    }
  };

  const handleLogout = () => {
    clearAdminSecretKey();
    setIsAdminAuthenticated(false);
    setSecretInput('');
    setAdminMessage('');
    toast.info('Logged out from Developer Console.', 'Session Closed');
  };

  const filteredLogs = adminLogs.filter((log) => {
    if (logFilter === 'all') return true;
    const lower = log.toLowerCase();
    return lower.includes(`[${logFilter}]`) || lower.includes(`${logFilter}:`);
  });

  return (
    <div>
      <SEO
        title={t('dev.title')}
        description={t('dev.description')}
      />

      {!isAdminAuthenticated ? (
        <Container maxWidth="xs" padding="lg">
          <Card
            glow="blue"
            padding="xl"
            title={t('dev.authTitle')}
            subtitle={t('dev.authSubtitle')}
          >
            <form onSubmit={handleAdminLogin}>
              <Stack gap="lg">
                <Input
                  label={t('dev.secretPasskeyLabel')}
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder={t('dev.secretPasskeyPlaceholder')}
                  passwordToggle
                  clearable
                  leftIcon={<Key size={15} />}
                />

                {adminMessage && (
                  <Alert
                    variant={adminMessage.includes('successful') ? 'success' : 'danger'}
                    description={adminMessage}
                  />
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth>
                  {t('dev.verifyBtn')}
                </Button>
              </Stack>
            </form>
          </Card>
        </Container>
      ) : (
        <Stack gap="2xl">
          <Inline justify="between" align="center" wrap gap="md">
            <Stack gap="3xs">
              <Inline align="center" gap="sm">
                <Text as="h2" size="2xl" weight="bold">
                  {t('dev.adminTitle')}
                </Text>
                <Badge variant="online" dot pulse>{t('dev.fastApiActive')}</Badge>
              </Inline>
              <Text size="sm" color="secondary">
                {t('dev.connectedServer')}
              </Text>
            </Stack>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut size={14} /> {t('dev.logoutBtn')}
            </Button>
          </Inline>

          <Grid minItemWidth="lg" gap="2xl">
            <Card
              glow="blue"
              title={t('dev.systemControlsTitle')}
              subtitle={t('dev.systemControlsSubtitle')}
            >
              <Stack gap="md">
                <Inline align="center" gap="md">
                  <Button variant="secondary" size="sm" onClick={handleForceSync}>
                    <RefreshCw size={14} /> {t('dev.forceSyncBtn')}
                  </Button>
                  {syncStatus && (
                    <Text size="sm" color="brand">
                      {syncStatus}
                    </Text>
                  )}
                </Inline>
                <ProgressBar
                  value={100}
                  size="sm"
                  variant="brand"
                  label={t('dev.cacheCoherencyLabel')}
                  showValue
                  valueFormat={() => t('dev.synchronized')}
                />
              </Stack>
            </Card>

            <Card
              glow="purple"
              title={t('dev.prometheusTitle')}
              subtitle={t('dev.prometheusSubtitle')}
            >
              <Stack gap="md">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open('/metrics', '_blank')}
                >
                  <ExternalLink size={14} /> {t('dev.viewMetricsBtn')}
                </Button>
                <ProgressBar
                  value={98}
                  size="sm"
                  variant="purple"
                  label={t('dev.metricHealthLabel')}
                  showValue
                  valueFormat={() => t('dev.uptimeHealth')}
                />
              </Stack>
            </Card>
          </Grid>

          <Card
            glow="none"
            title={t('dev.logsTitle')}
            action={
              <Select
                size="sm"
                value={logFilter}
                onValueChange={setLogFilter}
                options={LOG_LEVEL_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: t(opt.labelKey),
                }))}
              />
            }
          >
            <Terminal logs={filteredLogs.length > 0 ? filteredLogs : adminLogs} />
          </Card>
        </Stack>
      )}
    </div>
  );
};



