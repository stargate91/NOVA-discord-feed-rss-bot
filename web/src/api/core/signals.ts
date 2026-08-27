/**
 * Combines multiple AbortSignals so that any single abort triggers cancellation.
 */
export const combineSignals = (signals: (AbortSignal | undefined)[]): AbortSignal => {
  const activeSignals = signals.filter((s): s is AbortSignal => Boolean(s));
  if (activeSignals.length === 0) {
    return new AbortController().signal;
  }
  if (activeSignals.length === 1) {
    return activeSignals[0];
  }

  // Modern browser AbortSignal.any support
  if (
    typeof AbortSignal !== 'undefined' &&
    'any' in AbortSignal &&
    typeof AbortSignal.any === 'function'
  ) {
    return AbortSignal.any(activeSignals);
  }

  const controller = new AbortController();
  for (const signal of activeSignals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
};
