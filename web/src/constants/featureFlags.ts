export interface FeatureFlags {
  useMockData: boolean;
  mockAuth: boolean;
  enableDebugLogging: boolean;
}

export const getFeatureFlags = (): FeatureFlags => {
  const isTest = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test';
  if (isTest) {
    return {
      useMockData: true,
      mockAuth: true,
      enableDebugLogging: false,
    };
  }

  const explicitMockAuth =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_MOCK_AUTH : undefined;
  const explicitMockData =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_USE_MOCK_DATA : undefined;

  const mockAuth = explicitMockAuth !== undefined ? explicitMockAuth === 'true' : false;
  const useMockData = explicitMockData !== undefined ? explicitMockData === 'true' : false;

  return {
    useMockData,
    mockAuth,
    enableDebugLogging: typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV),
  };
};

export const featureFlags = getFeatureFlags();
