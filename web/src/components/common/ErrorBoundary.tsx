import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../../ui';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  isGlobal?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log structured error context
    console.error(`[ErrorBoundary:${this.props.name || 'Global'}] Uncaught exception:`, error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = (): void => {
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

      return (
        <div className={isGlobal ? styles.errorWrapper : styles.inlineErrorWrapper}>
          <div className={styles.errorCard}>
            <div className={styles.iconCircle}>
              <AlertTriangle size={24} color="var(--status-danger)" />
            </div>

            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.subtitle}>
              An unexpected client error occurred in the {name} component.
            </p>

            {error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorSummary}>
                  Diagnostic Information
                </summary>
                <div className={styles.errorMessage}>
                  {error.name}: {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </div>
              </details>
            )}

            <div className={styles.actions}>
              <Button variant="secondary" onClick={this.handleReset}>
                <RefreshCw size={14} /> Try Again
              </Button>
              <Button variant="primary" onClick={this.handleReload}>
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
