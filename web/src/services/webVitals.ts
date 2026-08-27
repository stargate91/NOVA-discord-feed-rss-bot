/**
 * Lightweight Zero-Dependency Core Web Vitals & Performance Monitoring Observer
 */

export interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export type WebVitalReportHandler = (metric: WebVitalMetric) => void;

function getRating(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

/**
 * Initializes Core Web Vitals observers and notifies the handler.
 */
export function initWebVitals(onReport: WebVitalReportHandler): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

  const observedMetrics = new Set<string>();

  const report = (name: WebVitalMetric['name'], value: number) => {
    const rounded = Math.round(name === 'CLS' ? value * 1000 : value) / (name === 'CLS' ? 1000 : 1);
    onReport({
      name,
      value: rounded,
      rating: getRating(name, rounded),
      delta: rounded,
      id: `v1-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    });
  };

  // 1. First Contentful Paint (FCP) & Time to First Byte (TTFB)
  try {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0];
      report('TTFB', nav.responseStart - nav.requestStart);
    }

    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint' && !observedMetrics.has('FCP')) {
        observedMetrics.add('FCP');
        report('FCP', entry.startTime);
      }
    });
  } catch {
    // Ignore performance API errors in older browsers
  }

  // 2. Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        report('LCP', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Unsupported entry type
  }

  // 3. Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput && typeof layoutShift.value === 'number') {
          clsValue += layoutShift.value;
          report('CLS', clsValue);
        }
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // Unsupported entry type
  }

  // 4. First Input Delay (FID) / Interaction to Next Paint (INP)
  try {
    const firstInputObserver = new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0] as PerformanceEventTiming;
      if (firstInput && !observedMetrics.has('FID')) {
        observedMetrics.add('FID');
        report('FID', firstInput.processingStart - firstInput.startTime);
      }
    });
    firstInputObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // Unsupported entry type
  }
}
