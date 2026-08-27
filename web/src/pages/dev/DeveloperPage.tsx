import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Layers } from 'lucide-react';
import { apiClient } from '@/api';
import { errorReporter } from '@/services/errorReporter';
import { useAuth } from '@/auth';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/common/Toast';
import { SEO } from '@/components/common/SEO';
import { Button, Badge, Stack, Inline, Grid, Text } from '@/ui';
import {
  DevAuthGateway,
  SystemControlsCard,
  MetricsTelemetryCard,
  AdminTerminalLogsCard,
} from './components';

interface AdminLogsResponse {
  logs?: string[];
}

export const DeveloperPage: React.FC = () => {
  const { adminSecret, setAdminSecretKey, clearAdminSecretKey } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(Boolean(adminSecret));
  const [adminLogs, setAdminLogs] = useState<string[]>([]);
  const [adminMessage, setAdminMessage] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleAdminLogin = async (secret: string) => {
    setIsVerifying(true);
    try {
      const data = await apiClient.get<AdminLogsResponse>('/api/v1/admin/logs?limit=10', {
        adminSecret: secret,
      });

      setAdminSecretKey(secret);
      setIsAdminAuthenticated(true);
      setAdminLogs(data.logs || [t('dev.initialAuthLog')]);
      setAdminMessage(t('dev.authSuccessMessage'));
      toast.success(t('dev.toastAccessGranted'), t('dev.toastAccessGrantedTitle'));
    } catch (err: unknown) {
      errorReporter.captureException(err, { action: 'admin_login' }, 'warning');
      setAdminMessage(t('dev.authDeniedMessage'));
      toast.error(t('dev.toastAccessDenied'), t('dev.toastAccessDeniedTitle'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncStatus(t('dev.syncStatusSynchronizing'));
    try {
      await apiClient.post('/api/v1/monitors/sync', undefined, {
        adminSecret: adminSecret || '',
      });
      setSyncStatus(t('dev.syncStatusSuccess'));
      toast.success(t('dev.toastSyncComplete'), t('dev.toastSyncCompleteTitle'));
    } catch (err: unknown) {
      errorReporter.captureException(err, { action: 'monitors_sync' }, 'error');
      setSyncStatus(t('dev.syncStatusFailed'));
      toast.error(t('dev.toastSyncError'), t('dev.toastSyncErrorTitle'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    clearAdminSecretKey();
    setIsAdminAuthenticated(false);
    setAdminMessage('');
    toast.info(t('dev.toastLogout'), t('dev.toastLogoutTitle'));
  };

  return (
    <div>
      <SEO title={t('dev.title')} description={t('dev.description')} noIndex />

      {!isAdminAuthenticated ? (
        <DevAuthGateway
          onVerify={handleAdminLogin}
          authMessage={adminMessage}
          isVerifying={isVerifying}
        />
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
            <SystemControlsCard
              onForceSync={handleForceSync}
              syncStatus={syncStatus}
              isSyncing={isSyncing}
            />

            <MetricsTelemetryCard />
          </Grid>

          <AdminTerminalLogsCard logs={adminLogs} />
        </Stack>
      )}
    </div>
  );
};
