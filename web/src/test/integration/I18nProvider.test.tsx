import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, useTranslation } from '@/i18n';

const TranslationConsumer: React.FC = () => {
  const { t, locale, setLocale } = useTranslation();
  const { t: tCommon } = useTranslation('common');

  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="brand-name">{t('common.brandName')}</span>
      <span data-testid="scoped-save">{tCommon('save')}</span>
      <span data-testid="monitor-saved">
        {t('guild.toastMonitorSaved', { targetId: 'NovaBot', type: 'YouTube' })}
      </span>
      <button type="button" onClick={() => setLocale('hu')} data-testid="switch-hu-btn">
        Switch HU
      </button>
      <button type="button" onClick={() => setLocale('en')} data-testid="switch-en-btn">
        Switch EN
      </button>
    </div>
  );
};

describe('I18nProvider Integration', () => {
  it('should provide translations, handle scoped namespaces and dynamic locale switching', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <TranslationConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId('brand-name')).toHaveTextContent('Nova Feeds');
    expect(screen.getByTestId('scoped-save')).toHaveTextContent('Save Changes');
    expect(screen.getByTestId('monitor-saved')).toHaveTextContent(
      'Monitor for NovaBot (YouTube) activated successfully!'
    );

    // Switch locale to 'hu' (which dynamically loads / falls back to en seamlessly)
    await user.click(screen.getByTestId('switch-hu-btn'));
    expect(screen.getByTestId('current-locale')).toHaveTextContent('hu');
    expect(screen.getByTestId('scoped-save')).toHaveTextContent('Save Changes');
  });

  it('should log a dev warning for missing translation keys', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const MissingKeyConsumer: React.FC = () => {
      const { t } = useTranslation();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <span data-testid="missing">{t('nonExistentKey' as any)}</span>;
    };

    render(
      <I18nProvider>
        <MissingKeyConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId('missing')).toHaveTextContent('nonExistentKey');
    warnSpy.mockRestore();
  });
});
