import { useState, useCallback } from 'react';
import { CryptoPair, normalizeCryptoSymbol, parseCryptoPairsFromString } from '@/utils/monitor_form';

export interface UseCryptoPairsOptions {
  initialPairs?: CryptoPair[];
  initialString?: string;
}

export function useCryptoPairs(options?: UseCryptoPairsOptions | CryptoPair[]) {
  const getInitialPairs = (): CryptoPair[] => {
    if (Array.isArray(options)) {
      return options.length > 0 ? options : [{ symbol: '', threshold: '' }];
    }
    if (options?.initialPairs && options.initialPairs.length > 0) {
      return options.initialPairs;
    }
    if (options?.initialString) {
      return parseCryptoPairsFromString(options.initialString);
    }
    return [{ symbol: '', threshold: '' }];
  };

  const [cryptoPairs, setCryptoPairs] = useState<CryptoPair[]>(getInitialPairs);

  const addCryptoPair = useCallback(() => {
    setCryptoPairs((prev) => [...prev, { symbol: '', threshold: '' }]);
  }, []);

  const removeCryptoPair = useCallback((index: number) => {
    setCryptoPairs((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const updateCryptoPair = useCallback((index: number, field: keyof CryptoPair, value: string) => {
    setCryptoPairs((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'symbol' ? normalizeCryptoSymbol(value) : value,
      };
      return updated;
    });
  }, []);

  const resetCryptoPairs = useCallback((pairs?: CryptoPair[]) => {
    setCryptoPairs(pairs && pairs.length > 0 ? pairs : [{ symbol: '', threshold: '' }]);
  }, []);

  return {
    cryptoPairs,
    setCryptoPairs,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    resetCryptoPairs,
  };
}
