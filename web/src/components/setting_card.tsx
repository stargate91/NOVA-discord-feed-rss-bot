import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Text } from '@/components/ui';
import styles from './setting_card.module.css';

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
        <div className={styles["title-row"]}>
          {Icon && (
            <div className={styles["icon-box"]}>
              <Icon size={16} />
            </div>
          )}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && (
          <Text as="p" size="xs" variant="secondary" className={styles["card-desc"]}>
            {description}
          </Text>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
