import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { errorReporter } from './services/errorReporter';
import { initWebVitals } from './services/webVitals';
import { registerServiceWorker } from './serviceWorkerRegistration';

// Initialize performance monitoring
initWebVitals((metric) => {
  errorReporter.addBreadcrumb({
    category: 'web-vitals',
    message: `${metric.name}: ${metric.value} (${metric.rating})`,
    level: metric.rating === 'poor' ? 'warning' : 'info',
    data: { name: metric.name, value: metric.value, rating: metric.rating },
  });
});

// Register Service Worker for offline resilience & cache-first assets
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
