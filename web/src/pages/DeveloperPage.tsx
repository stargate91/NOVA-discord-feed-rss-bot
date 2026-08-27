import React, { useState } from 'react';
import { apiClient } from '../api';
import { useAuth } from '../auth';
import { useToast } from '../components/common/Toast';
import { SEO } from '../components/common/SEO';
import { Button, Card, Input, Terminal } from '../ui';
import styles from './DeveloperPage.module.css';

interface AdminLogsResponse {
  logs?: string[];
}

export const DeveloperPage: React.FC = () => {
  const { adminSecret, setAdminSecretKey, clearAdminSecretKey } = useAuth();
  const toast = useToast();
  const [secretInput, setSecretInput] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(Boolean(adminSecret));
  const [adminLogs, setAdminLogs] = useState<string[]>([]);
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

  return (
    <div>
      <SEO
        title="Developer Console & System Telemetry"
        description="Direct operational diagnostics, log inspection, and Prometheus metrics for Nova Feeds."
      />

      {!isAdminAuthenticated ? (
        <div className={styles.authWrapper}>
          <Card
            title="Developer Authentication"
            subtitle="Enter your server WEBHOOK_SECRET passkey to open the Developer Management Portal."
          >
            <form onSubmit={handleAdminLogin}>
              <Input
                label="Secret Key"
                type="password"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="Enter WEBHOOK_SECRET..."
                className={styles.authInput}
              />

              {adminMessage && (
                <p className={adminMessage.includes('successful') ? styles.authMsgSuccess : styles.authMsgDanger}>
                  {adminMessage}
                </p>
              )}

              <Button type="submit" variant="primary" fullWidth>
                Verify & Enter Portal
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        <div>
          <div className={styles.dashboardHeader}>
            <div>
              <h2>System Administration & Telemetry</h2>
              <p>Connected to FastAPI Microservice Server (:8080)</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          <div className={styles.grid2}>
            <Card
              title="System Controls"
              subtitle="Trigger immediate monitor cache reloads from the database."
            >
              <div className={styles.controlRow}>
                <Button variant="secondary" size="sm" onClick={handleForceSync}>
                  Force Monitor Sync
                </Button>
                {syncStatus && (
                  <span className={styles.statusMsg}>
                    {syncStatus}
                  </span>
                )}
              </div>
            </Card>

            <Card
              title="Prometheus Metrics"
              subtitle="Real-time telemetry and counter exposition."
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open('/metrics', '_blank')}
              >
                View /metrics Endpoint ↗
              </Button>
            </Card>
          </div>

          <Card title="Recent System Logs (Ring Buffer)">
            <Terminal logs={adminLogs} />
          </Card>
        </div>
      )}
    </div>
  );
};
