import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WebVitalMetric } from '@/services/webVitals';
import { initWebVitals } from '@/services/webVitals';

describe('Core Web Vitals Performance Monitor (INP / LCP / CLS / TTFB / FCP)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports TTFB and FCP when performance entries are present', () => {
    const reportedMetrics: WebVitalMetric[] = [];

    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 250,
          } as unknown as PerformanceNavigationTiming,
        ];
      }
      if (type === 'paint') {
        return [
          {
            name: 'first-contentful-paint',
            startTime: 450,
          } as unknown as PerformancePaintTiming,
        ];
      }
      return [];
    });

    initWebVitals((metric) => {
      reportedMetrics.push(metric);
    });

    const ttfb = reportedMetrics.find((m) => m.name === 'TTFB');
    const fcp = reportedMetrics.find((m) => m.name === 'FCP');

    expect(ttfb).toBeDefined();
    expect(ttfb?.value).toBe(150);
    expect(ttfb?.rating).toBe('good');

    expect(fcp).toBeDefined();
    expect(fcp?.value).toBe(450);
    expect(fcp?.rating).toBe('good');
  });

  it('safely handles missing PerformanceObserver API', () => {
    const originalObserver = globalThis.PerformanceObserver;
    // @ts-expect-error - testing undefined observer
    delete globalThis.PerformanceObserver;

    const mockReport = vi.fn();
    expect(() => initWebVitals(mockReport)).not.toThrow();

    globalThis.PerformanceObserver = originalObserver;
  });
});
