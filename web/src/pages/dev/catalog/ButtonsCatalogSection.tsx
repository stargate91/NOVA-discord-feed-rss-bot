/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import { ExternalLink, Bot, Zap, Bell } from 'lucide-react';
import { Card, Stack, Inline, Text, Button, IconButton, Divider } from '@/ui';

export const ButtonsCatalogSection: React.FC = () => {
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [btnSize, setBtnSize] = useState<'xs' | 'sm' | 'md' | 'lg'>('md');

  return (
    <Stack gap="xl">
      <Card padding="lg" glow="blue">
        <Stack gap="md">
          <Inline justify="between" align="center">
            <div>
              <Text as="h2" size="lg" weight="bold">
                Button Component (Polymorphic Generic)
              </Text>
              <Text size="xs" color="secondary">
                Supports 13 visual variants, 4 sizes, loading spinner, icons, and polymorphic generic `as` prop.
              </Text>
            </div>
            <Inline gap="xs">
              <Button
                size="xs"
                variant={btnLoading ? 'primary' : 'outline'}
                onClick={() => setBtnLoading(!btnLoading)}
              >
                Toggle Loading
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  const sizes: ('xs' | 'sm' | 'md' | 'lg')[] = ['xs', 'sm', 'md', 'lg'];
                  const next = sizes[(sizes.indexOf(btnSize) + 1) % sizes.length];
                  setBtnSize(next);
                }}
              >
                Size: {btnSize.toUpperCase()}
              </Button>
            </Inline>
          </Inline>

          <Divider />

          <Text size="xs" weight="bold" color="secondary">
            COLOR VARIANTS MATRIX
          </Text>
          <Inline gap="sm" wrap>
            <Button variant="primary" size={btnSize} loading={btnLoading}>
              Primary
            </Button>
            <Button variant="secondary" size={btnSize} loading={btnLoading}>
              Secondary
            </Button>
            <Button
              variant="discord"
              size={btnSize}
              loading={btnLoading}
              icon={<Bot size={16} />}
            >
              Discord
            </Button>
            <Button
              variant="gradient"
              size={btnSize}
              loading={btnLoading}
              icon={<Zap size={16} />}
            >
              Gradient
            </Button>
            <Button variant="success" size={btnSize} loading={btnLoading}>
              Success
            </Button>
            <Button variant="danger" size={btnSize} loading={btnLoading}>
              Danger
            </Button>
            <Button variant="outline" size={btnSize} loading={btnLoading}>
              Outline
            </Button>
            <Button variant="glass" size={btnSize} loading={btnLoading}>
              Glass
            </Button>
            <Button variant="ghost" size={btnSize} loading={btnLoading}>
              Ghost
            </Button>
            <Button variant="soft" size={btnSize} loading={btnLoading}>
              Soft
            </Button>
            <Button variant="danger-outline" size={btnSize} loading={btnLoading}>
              Danger Outline
            </Button>
          </Inline>

          <Text size="xs" weight="bold" color="secondary">
            POLYMORPHIC AS ANCHOR LINK (Type-Safe Generic)
          </Text>
          <Inline gap="sm">
            <Button
              as="a"
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
              rightIcon={<ExternalLink size={14} />}
            >
              External Anchor Link
            </Button>
            <IconButton
              icon={<Bell size={18} />}
              aria-label="Notifications"
              variant="secondary"
              size={btnSize}
            />
          </Inline>
        </Stack>
      </Card>
    </Stack>
  );
};
