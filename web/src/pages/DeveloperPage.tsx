import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ExternalLink, LogOut, Key, Layers } from 'lucide-react';
import { apiClient } from '@/api';
import { errorReporter } from '@/services/errorReporter';
import { useAuth } from '@/auth';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import { SEO } from '@/components/common/SEO';
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
} from '@/ui';

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
      toast.warning(t('dev.toastSecretRequired'), t('dev.toastSecretRequiredTitle'));
      return;
    }

    try {
      const data = await apiClient.get<AdminLogsResponse>('/api/v1/admin/logs?limit=10', {
        adminSecret: secretInput.trim(),
      });

      setAdminSecretKey(secretInput.trim());
      setIsAdminAuthenticated(true);
      setAdminLogs(data.logs || [t('dev.initialAuthLog')]);
      setAdminMessage(t('dev.authSuccessMessage'));
      toast.success(t('dev.toastAccessGranted'), t('dev.toastAccessGrantedTitle'));
    } catch (err: unknown) {
      errorReporter.captureException(err, { action: 'admin_login' }, 'warning');
      setAdminMessage(t('dev.authDeniedMessage'));
      toast.error(t('dev.toastAccessDenied'), t('dev.toastAccessDeniedTitle'));
    }
  };

  const handleForceSync = async () => {
    setSyncStatus(t('dev.syncStatusSynchronizing'));
    try {
      await apiClient.post('/api/v1/monitors/sync', undefined, {
        adminSecret: adminSecret || secretInput,
      });
      setSyncStatus(t('dev.syncStatusSuccess'));
      toast.success(t('dev.toastSyncComplete'), t('dev.toastSyncCompleteTitle'));
    } catch (err: unknown) {
      errorReporter.captureException(err, { action: 'monitors_sync' }, 'error');
      setSyncStatus(t('dev.syncStatusFailed'));
      toast.error(t('dev.toastSyncError'), t('dev.toastSyncErrorTitle'));
    }
  };

  const handleLogout = () => {
    clearAdminSecretKey();
    setIsAdminAuthenticated(false);
    setSecretInput('');
    setAdminMessage('');
    toast.info(t('dev.toastLogout'), t('dev.toastLogoutTitle'));
  };

  const filteredLogs = adminLogs.filter((log) => {
    if (logFilter === 'all') return true;
    const lower = log.toLowerCase();
    return lower.includes(`[${logFilter}]`) || lower.includes(`${logFilter}:`);
  });

  return (
    <div>
      <SEO title={t('dev.title')} description={t('dev.description')} noIndex />

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
                <Badge variant="online" dot pulse>
                  {t('dev.fastApiActive')}
                </Badge>
              </Inline>
              <Text size="sm" color="secondary">
                {t('dev.connectedServer')}
              </Text>
            </Stack>

            <Inline gap="sm">
              <Button as={Link} to="/dev/ui" variant="outline" size="sm">
                <Layers size={14} /> {t('dev.uiCatalogBtn')}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut size={14} /> {t('dev.logoutBtn')}
              </Button>
            </Inline>
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
