import { useState, useCallback } from 'react';
import {
  MonitorFormData,
  INITIAL_MONITOR_FORM_DATA,
  validateMonitorForm,
  parseCryptoPairsFromString,
  CryptoPair,
} from '@/utils/monitor_form';
import { PlatformMetadata } from '@/types/monitor';
import { useCryptoPairs } from './use_crypto_pairs';
import { TierFeatureName } from '@/utils/tier_limits';

export interface UseMonitorFormStateOptions<T extends MonitorFormData = MonitorFormData> {
  initialData?: T;
  isLocked?: (featureName: TierFeatureName) => boolean;
}

export function useMonitorFormState<T extends MonitorFormData = MonitorFormData>(
  options: UseMonitorFormStateOptions<T> = {}
) {
  const { initialData = INITIAL_MONITOR_FORM_DATA as T, isLocked } = options;

  const [formData, setFormData] = useState<T>(initialData);

  const {
    cryptoPairs,
    setCryptoPairs,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    resetCryptoPairs,
  } = useCryptoPairs();

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateMultiField = useCallback(<K extends keyof T>(field: K, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleField = useCallback(<K extends keyof T>(field: K, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  }, []);

  const handleColorChange = useCallback((color: string) => {
    if (!isLocked || !isLocked('custom_color')) {
      setFormData((prev) => ({ ...prev, embed_color: color }));
    }
  }, [isLocked]);

  const insertTemplateVariable = useCallback((varName: string) => {
    if (!isLocked || !isLocked('alert_template')) {
      setFormData((prev) => ({
        ...prev,
        custom_alert: (prev.custom_alert || '') + `{${varName}}`,
      }));
    }
  }, [isLocked]);

  const loadCryptoFromString = useCallback((str?: string) => {
    if (str) {
      setCryptoPairs(parseCryptoPairsFromString(str));
    } else {
      resetCryptoPairs();
    }
  }, [setCryptoPairs, resetCryptoPairs]);

  const validate = useCallback((platform: PlatformMetadata | null): string | null => {
    return validateMonitorForm(formData, platform, cryptoPairs);
  }, [formData, cryptoPairs]);

  const resetForm = useCallback((customData?: T) => {
    setFormData(customData || initialData);
    resetCryptoPairs();
  }, [initialData, resetCryptoPairs]);

  return {
    formData,
    setFormData,
    updateField,
    updateMultiField,
    toggleField,
    handleColorChange,
    insertTemplateVariable,
    loadCryptoFromString,
    validate,
    resetForm,
    cryptoPairs,
    setCryptoPairs,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    resetCryptoPairs,
  };
}
