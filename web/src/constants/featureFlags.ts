export interface FeatureFlags {
  useMockData: boolean;
  mockAuth: boolean;
  enableDebugLogging: boolean;
}

export const getFeatureFlags = (): FeatureFlags => {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '');

  const forceMockAuth =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_MOCK_AUTH === 'true';

  const forceMockData =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_DATA === 'true';

  // Enable mock data when explicitly configured or in local development
  const useMockData = forceMockData || (forceMockAuth && isLocalhost);

  return {
    useMockData,
    mockAuth: forceMockAuth || isLocalhost,
    enableDebugLogging: typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV),
  };
};

export const featureFlags = getFeatureFlags();
