import type { ContextType, ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { errorReporter } from '@/services/errorReporter';
import { I18nContext } from '@/i18n/context';
import { queryCache } from '@/api';
import { Button } from '@/ui';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  isGlobal?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static override contextType = I18nContext;
  declare public context: ContextType<typeof I18nContext>;

  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Send structured report to Telemetry/Error reporting service
    errorReporter.captureException(
      error,
      {
        boundaryName: this.props.name || 'Global',
        isGlobal: this.props.isGlobal ?? false,
        componentStack: errorInfo.componentStack,
      },
      'fatal'
    );

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = (): void => {
    // Clear the query cache so remounted components execute clean re-fetches
    queryCache.clear();

    if (this.props.onReset) {
      this.props.onReset();
    }

    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isGlobal = false, name = 'Application' } = this.props;
      const { error } = this.state;
      const t =
        this.context?.t ??
        ((key: string, params?: Record<string, string | number>) => {
          if (key === 'common.errorBoundaryTitle') return 'Something went wrong';
          if (key === 'common.errorBoundarySubtitle')
            return `An unexpected client error occurred in the ${params?.name ?? 'Application'} component.`;
          if (key === 'common.errorBoundaryDetails') return 'Diagnostic Information';
          if (key === 'common.errorBoundaryTryAgain') return 'Try Again';
          if (key === 'common.errorBoundaryReload') return 'Reload Application';
          return key;
        });

      return (
        <div className={isGlobal ? styles.errorWrapper : styles.inlineErrorWrapper}>
          <div className={styles.errorCard}>
            <div className={styles.iconCircle}>
              <AlertTriangle size={24} color="var(--status-danger)" />
            </div>

            <h2 className={styles.title}>{t('common.errorBoundaryTitle')}</h2>
            <p className={styles.subtitle}>{t('common.errorBoundarySubtitle', { name })}</p>

            {error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorSummary}>
                  {t('common.errorBoundaryDetails')}
                </summary>
                <div className={styles.errorMessage}>
                  {error.name}: {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </div>
              </details>
            )}

            <div className={styles.actions}>
              <Button variant="secondary" onClick={this.handleReset}>
                <RefreshCw size={14} /> {t('common.errorBoundaryTryAgain')}
              </Button>
              <Button variant="primary" onClick={this.handleReload}>
                {t('common.errorBoundaryReload')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
