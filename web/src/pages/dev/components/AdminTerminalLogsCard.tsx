import React, { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Card, Select, Terminal } from '@/ui';

export const LOG_LEVEL_OPTIONS = [
  { value: 'all', labelKey: 'dev.logLevelAll' },
  { value: 'info', labelKey: 'dev.logLevelInfo' },
  { value: 'warn', labelKey: 'dev.logLevelWarn' },
  { value: 'error', labelKey: 'dev.logLevelError' },
  { value: 'debug', labelKey: 'dev.logLevelDebug' },
] as const;

export interface AdminTerminalLogsCardProps {
  logs: string[];
}

export const AdminTerminalLogsCard: React.FC<AdminTerminalLogsCardProps> = ({ logs }) => {
  const { t } = useTranslation();
  const [logFilter, setLogFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    const lower = log.toLowerCase();
    return lower.includes(`[${logFilter}]`) || lower.includes(`${logFilter}:`);
  });

  return (
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
      <Terminal logs={filteredLogs.length > 0 ? filteredLogs : logs} />
    </Card>
  );
};
