import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Container, Card, Stack, Input, Alert, Button } from '@/ui';

export interface DevAuthGatewayProps {
  onVerify: (secret: string) => Promise<void>;
  authMessage?: string;
  isVerifying?: boolean;
}

export const DevAuthGateway: React.FC<DevAuthGatewayProps> = ({
  onVerify,
  authMessage,
  isVerifying = false,
}) => {
  const { t } = useTranslation();
  const [secretInput, setSecretInput] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) return;
    await onVerify(secretInput.trim());
  };

  return (
    <Container maxWidth="xs" padding="lg">
      <Card glow="blue" padding="xl" title={t('dev.authTitle')} subtitle={t('dev.authSubtitle')}>
        <form onSubmit={handleSubmit}>
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

            {authMessage && (
              <Alert
                variant={authMessage.includes('successful') ? 'success' : 'danger'}
                description={authMessage}
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isVerifying || !secretInput.trim()}
            >
              {t('dev.verifyBtn')}
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
};
