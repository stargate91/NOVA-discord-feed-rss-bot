import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function SettingCard({ title, description, icon: Icon, children, style }: SettingCardProps) {
  return (
    <div className="ui-setting-card" style={style}>
      <div className="ui-card-glow"></div>
      <div className="ui-setting-card-header">
        <div className="ui-stat-icon" style={{ marginBottom: 0, width: '48px', height: '48px' }}>
          {Icon && <Icon size={24} />}
        </div>
        <div>
          <h3 className="ui-monitor-name" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{title}</h3>
          {description && <p className="ui-dashboard-subtitle" style={{ fontSize: '0.85rem' }}>{description}</p>}
        </div>
      </div>
      <div className="ui-setting-card-body">
        {children}
      </div>
    </div>
  );
}
