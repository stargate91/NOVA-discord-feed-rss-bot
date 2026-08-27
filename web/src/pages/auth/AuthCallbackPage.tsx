import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, LogIn, Sparkles, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useAuth, validateOAuthState, saveAuthSession } from '@/auth';
import type { DiscordUser } from '@/auth';
import { apiClient } from '@/api/client';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Container, Card, Button, Stack, Inline, Text, Spinner } from '@/ui';
import { featureFlags, DISCORD_CLIENT_ID } from '@/constants';

interface AuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  user: DiscordUser;
}

// Module-level deduplication maps that survive React StrictMode unmount/remount
const inFlightExchanges = new Map<string, Promise<AuthResponse>>();
const completedCodes = new Set<string>();

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mockLogin, rehydrateSession, loginWithDiscord } = useAuth();
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const codeParam = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUri = `${originUrl}/auth/callback`;

  useEffect(() => {
    const processOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const oauthError = searchParams.get('error');

      if (oauthError) {
        setError(searchParams.get('error_description') || `Discord Authorization Error: ${oauthError}`);
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError('Missing OAuth2 authorization code in callback URL.');
        setIsProcessing(false);
        return;
      }

      // If this code was already successfully exchanged, skip duplicate execution
      if (completedCodes.has(code)) {
        return;
      }

      // 1. Enforce strict CSRF OAuth state token validation in production
      const isStateValid = validateOAuthState(state);
      const isMockPermitted =
        !import.meta.env.PROD && (featureFlags.mockAuth || featureFlags.useMockData);

      if (!isStateValid && import.meta.env.PROD) {
        setError('Invalid CSRF OAuth state token. Possible security violation or expired login.');
        setIsProcessing(false);
        return;
      }

      try {
        // 2. Mock mode fallback if mock is strictly forced
        if (isMockPermitted && featureFlags.useMockData) {
          mockLogin();
          navigate('/servers', { replace: true });
          return;
        }

        // 3. Deduplicated live OAuth code exchange with FastAPI backend
        const targetRedirectUri = `${window.location.origin}/auth/callback`;
        
        let exchangePromise = inFlightExchanges.get(code);
        if (!exchangePromise) {
          exchangePromise = apiClient.post<AuthResponse>('/api/v1/auth/discord', {
            code,
            redirect_uri: targetRedirectUri,
          });
          inFlightExchanges.set(code, exchangePromise);
        }

        const authData = await exchangePromise;
        completedCodes.add(code);

        if (authData && authData.access_token) {
          saveAuthSession(
            authData.access_token,
            authData.expires_in || 604800,
            authData.refresh_token,
            authData.user
          );
          apiClient.setAuthToken(authData.access_token);
          await rehydrateSession();
          navigate('/servers', { replace: true });
        } else {
          throw new Error('Invalid authentication response from backend.');
        }
      } catch (err: unknown) {
        if (code) {
          inFlightExchanges.delete(code);
        }
        // If live exchange fails in dev, allow fallback to mock if available
        if (isMockPermitted) {
          mockLogin();
          navigate('/servers', { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to complete Discord authentication.');
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, mockLogin, rehydrateSession, navigate]);

  const copyDiagnosticInfo = () => {
    const debugInfo = {
      error,
      client_id: DISCORD_CLIENT_ID,
      origin: originUrl,
      redirect_uri: redirectUri,
      code_length: codeParam?.length || 0,
      has_state: Boolean(stateParam),
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container maxWidth="sm" padding="lg">
      <SEO title={t('common.authCallbackTitle')} noIndex />
      <Card padding="xl" glow={error ? 'danger' : 'blue'}>
        <Stack align="center" gap="md">
          {isProcessing && (
            <>
              <Spinner size="lg" />
              <Text weight="bold">{t('common.checking')}</Text>
              <Text size="xs" color="secondary">
                {t('common.authCallbackVerifying')}
              </Text>
            </>
          )}

          {error && (
            <>
              <Inline align="center" gap="xs">
                <AlertCircle size={24} color="var(--status-danger)" />
                <Text weight="bold" size="lg" color="danger">
                  {t('common.authCallbackFailed')}
                </Text>
              </Inline>

              <Text size="sm" color="secondary" align="center" style={{ wordBreak: 'break-word' }}>
                {error}
              </Text>

              {/* Collapsible Diagnostic & Debug Information */}
              <div style={{ width: '100%', marginTop: '4px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setShowDebug(!showDebug)}
                  style={{ justifyContent: 'space-between' }}
                >
                  <Text size="xs" color="secondary">OAuth Diagnostic Details</Text>
                  {showDebug ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>

                {showDebug && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      wordBreak: 'break-all',
                    }}
                  >
                    <div><strong>Discord Client ID:</strong> {DISCORD_CLIENT_ID}</div>
                    <div><strong>Origin:</strong> {originUrl}</div>
                    <div><strong>Redirect URI:</strong> {redirectUri}</div>
                    <div><strong>Code Received:</strong> {codeParam ? `${codeParam.substring(0, 10)}... (length ${codeParam.length})` : 'None'}</div>
                    <div><strong>State Present:</strong> {stateParam ? 'Yes' : 'No'}</div>
                    <div style={{ marginTop: '6px' }}>
                      <Button variant="outline" size="sm" onClick={copyDiagnosticInfo}>
                        {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy Diagnostics'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Stack gap="sm" style={{ width: '100%', marginTop: '12px' }}>
                <Button
                  variant="discord"
                  fullWidth
                  onClick={() => loginWithDiscord()}
                >
                  <LogIn size={16} /> {t('common.loginWithDiscord')}
                </Button>

                {!import.meta.env.PROD && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      mockLogin();
                      navigate('/servers', { replace: true });
                    }}
                  >
                    <Sparkles size={16} /> {t('common.demoLogin')}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => navigate('/', { replace: true })}
                >
                  <Home size={14} /> {t('common.authCallbackReturnHome')}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </Container>
  );
};
