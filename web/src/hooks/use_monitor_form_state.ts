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

export interface UseMonitorFormStateOptions<T extends Record<string, any> = MonitorFormData> {
  initialData?: T;
  isLocked?: (featureName: TierFeatureName) => boolean;
}

export function useMonitorFormState<T extends Record<string, any> = MonitorFormData>(
  options: UseMonitorFormStateOptions<T> = {}
) {
  const { initialData = INITIAL_MONITOR_FORM_DATA as unknown as T, isLocked } = options;

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

  const updateFields = useCallback((fields: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  const updateMultiField = useCallback(<K extends keyof T>(field: K, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleField = useCallback(<K extends keyof T>(field: K, checked?: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked !== undefined ? checked : !prev[field],
    }));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    },
    []
  );

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
    return validateMonitorForm(formData as unknown as MonitorFormData, platform, cryptoPairs);
  }, [formData, cryptoPairs]);

  const resetForm = useCallback((customData?: T) => {
    setFormData(customData || initialData);
    resetCryptoPairs();
  }, [initialData, resetCryptoPairs]);

  return {
    formData,
    setFormData,
    handleChange,
    updateField,
    updateFields,
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
