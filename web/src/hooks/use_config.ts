import { useState, useEffect } from 'react';
import api from '@/services/api_client';

let globalConfig: Record<string, any> | null = null;
let listeners: Array<(config: Record<string, any>) => void> = [];

export function useConfig() {
  const [config, setConfig] = useState<Record<string, any> | null>(globalConfig);
  const [loading, setLoading] = useState<boolean>(() => !globalConfig);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (globalConfig) return;

    let ignore = false;
    const fetchConfig = async () => {
      try {
        const data = await api.get<Record<string, any>>('/api/config');
        globalConfig = data;
        if (!ignore) {
          setConfig(data);
          listeners.forEach(l => l(data));
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const listener = (newConfig: Record<string, any>) => setConfig(newConfig);
    listeners.push(listener);

    fetchConfig();

    return () => {
      ignore = true;
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getTierConfig = (tier: number | string, isPremium: boolean | number | string = false): Record<string, any> => {
    if (!config) return {};
    const effectiveTier = isPremium ? 3 : tier;
    return config.tier_config?.[String(effectiveTier)] || config.tier_config?.["0"] || {};
  };

  const hasFeature = (tier: number | string, isPremium: boolean | number | string, featureName: string): boolean => {
    // Aggressive check: if isPremium is true or truthy, bypass all locks
    if (isPremium === true || isPremium === 1 || isPremium === "true") return true;
    
    const tierConfig = getTierConfig(tier, isPremium);
    const features = tierConfig.features || [];
    return features.includes(featureName) || featureName === "basic";
  };

  return { config, loading, error, getTierConfig, hasFeature };
}
