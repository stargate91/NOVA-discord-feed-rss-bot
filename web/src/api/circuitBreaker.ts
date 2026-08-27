export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownMs?: number;
  halfOpenSuccessThreshold?: number;
}

export type CircuitStateListener = (state: CircuitState, previousState: CircuitState) => void;

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private failureThreshold: number;
  private cooldownMs: number;
  private halfOpenSuccessThreshold: number;
  private listeners: Set<CircuitStateListener> = new Set();

  public constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.cooldownMs = options.cooldownMs ?? 30000;
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold ?? 2;
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.cooldownMs) {
        this.transitionTo('HALF_OPEN');
      }
    }
    return this.state;
  }

  public onStateChange(listener: CircuitStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private transitionTo(nextState: CircuitState): void {
    if (this.state === nextState) return;
    const prev = this.state;
    this.state = nextState;
    if (nextState === 'CLOSED') {
      this.failureCount = 0;
      this.successCount = 0;
    } else if (nextState === 'HALF_OPEN') {
      this.successCount = 0;
    }
    this.listeners.forEach((fn) => {
      try {
        fn(nextState, prev);
      } catch {
        // Ignore listener exception
      }
    });
  }

  public recordSuccess(): void {
    const currentState = this.getState();
    if (currentState === 'HALF_OPEN') {
      this.successCount += 1;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.transitionTo('CLOSED');
      }
    } else if (currentState === 'CLOSED') {
      this.failureCount = 0;
    }
  }

  public recordFailure(): void {
    this.lastFailureTime = Date.now();
    const currentState = this.getState();

    if (currentState === 'HALF_OPEN') {
      this.transitionTo('OPEN');
    } else if (currentState === 'CLOSED') {
      this.failureCount += 1;
      if (this.failureCount >= this.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }
  }

  public isAvailable(): boolean {
    return this.getState() !== 'OPEN';
  }

  public reset(): void {
    this.transitionTo('CLOSED');
  }
}

export const apiCircuitBreaker = new CircuitBreaker();
