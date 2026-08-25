import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Text } from '@/components/ui';

export interface SettingCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export default function SettingCard({
  title,
  description,
  icon: Icon,
  children,
  className,
}: SettingCardProps) {
  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          {Icon && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-faint)',
                color: 'var(--accent-light)',
                border: '1px solid var(--border-accent)',
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </div>
          )}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && (
          <Text as="p" size="xs" variant="secondary" style={{ marginTop: 'var(--space-3xs)' }}>
            {description}
          </Text>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
