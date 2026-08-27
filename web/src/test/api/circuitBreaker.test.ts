import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from '@/api/circuitBreaker';

describe('CircuitBreaker Class', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker({
      failureThreshold: 3,
      cooldownMs: 100,
      halfOpenSuccessThreshold: 2,
    });
  });

  it('should initialize in CLOSED state and allow execution', () => {
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.isAvailable()).toBe(true);
  });

  it('should trip to OPEN after reaching failureThreshold', () => {
    cb.recordFailure();
    expect(cb.getState()).toBe('CLOSED');
    cb.recordFailure();
    expect(cb.getState()).toBe('CLOSED');
    cb.recordFailure(); // 3rd failure
    expect(cb.getState()).toBe('OPEN');
    expect(cb.isAvailable()).toBe(false);
  });

  it('should reset failure count on recordSuccess while CLOSED', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess();
    cb.recordFailure();
    expect(cb.getState()).toBe('CLOSED');
  });

  it('should transition to HALF_OPEN after cooldownMs expires', async () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('OPEN');

    // Wait for cooldown
    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(cb.isAvailable()).toBe(true);
    expect(cb.getState()).toBe('HALF_OPEN');
  });
});
