import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider, useTranslation } from '../../i18n';

const TranslationConsumer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <span data-testid="brand-name">{t('common.brandName')}</span>
      <span data-testid="monitor-saved">
        {t('guild.toastMonitorSaved', { targetId: 'NovaBot', type: 'YouTube' })}
      </span>
    </div>
  );
};

describe('I18nProvider Integration', () => {
  it('should provide translations correctly', () => {
    render(
      <I18nProvider>
        <TranslationConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId('brand-name')).toHaveTextContent('Nova Feeds');
    expect(screen.getByTestId('monitor-saved')).toHaveTextContent(
      'Monitor for NovaBot (YouTube) activated successfully!'
    );
  });
});
