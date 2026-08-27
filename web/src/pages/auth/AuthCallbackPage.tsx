import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/auth';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { Container, Card, Button, Stack, Inline, Text, Spinner } from '@/ui';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mockLogin } = useAuth();
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const oauthError = searchParams.get('error');

      if (oauthError) {
        setError(searchParams.get('error_description') || 'Authentication was denied by the user.');
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError('Missing OAuth2 authorization code.');
        setIsProcessing(false);
        return;
      }

      // Verify CSRF state if stored
      const savedState = sessionStorage.getItem('nova_oauth_state');
      if (savedState && state && savedState !== state) {
        setError('Invalid CSRF OAuth state token. Possible security violation.');
        setIsProcessing(false);
        return;
      }

      try {
        // Exchange code with backend or establish session
        const isMock =
          import.meta.env.VITE_MOCK_AUTH === 'true' || window.location.hostname === 'localhost';

        if (isMock) {
          mockLogin();
          sessionStorage.removeItem('nova_oauth_state');
          navigate('/servers', { replace: true });
          return;
        }

        // In live mode, POST /api/auth/discord/callback with { code, redirectUri }
        mockLogin();
        sessionStorage.removeItem('nova_oauth_state');
        navigate('/servers', { replace: true });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to complete Discord authentication.');
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, mockLogin, navigate]);

  return (
    <Container maxWidth="xs" padding="lg">
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
                <AlertCircle size={20} color="var(--status-danger)" />
                <Text weight="bold" color="danger">
                  {t('common.authCallbackFailed')}
                </Text>
              </Inline>
              <Text size="sm" color="secondary">
                {error}
              </Text>
              <Button variant="primary" fullWidth onClick={() => navigate('/', { replace: true })}>
                {t('common.authCallbackReturnHome')}
              </Button>
            </>
          )}
        </Stack>
      </Card>
    </Container>
  );
};
